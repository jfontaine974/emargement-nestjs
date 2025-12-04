import {
  Injectable,
  OnModuleDestroy,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, createConnection, Schema, Model } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AdminConnectionService } from './admin-connection.service';
import { EnvironmentVariables } from '../../config/environment.interface';

@Injectable()
export class TenantConnectionService implements OnModuleDestroy {
  private readonly logger = new Logger(TenantConnectionService.name);
  private connections: Map<string, Connection> = new Map();
  private connectionLocks: Map<string, Promise<Connection>> = new Map();
  private mongoMemoryServer: MongoMemoryServer | null = null;

  // Stockage du tenantId courant (sera defini par le middleware)
  private currentTenantId: string | null = null;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly adminConnection: AdminConnectionService,
  ) {}

  async onModuleDestroy() {
    // Fermer toutes les connexions tenant
    for (const [tenantId, connection] of this.connections.entries()) {
      try {
        await connection.close();
        this.logger.log(`Connexion tenant ${tenantId} fermee`);
      } catch (error) {
        this.logger.error(`Erreur fermeture tenant ${tenantId}`, error);
      }
    }
    this.connections.clear();

    // Fermer le serveur MongoDB en memoire
    if (this.mongoMemoryServer) {
      await this.mongoMemoryServer.stop();
      this.logger.log('MongoDB Memory Server arrete');
    }
  }

  setCurrentTenant(tenantId: string) {
    this.currentTenantId = tenantId;
  }

  getCurrentTenant(): string | null {
    return this.currentTenantId;
  }

  async getConnection(tenantId?: string): Promise<Connection> {
    const tid = tenantId || this.currentTenantId;

    if (!tid) {
      throw new Error('Aucun tenant defini');
    }

    // Mode test avec MongoDB en memoire
    if (this.configService.get('USE_MEMORY_DB')) {
      return this.getMemoryConnection(tid);
    }

    // Verifier le cache
    if (this.connections.has(tid)) {
      const conn = this.connections.get(tid)!;
      if (conn.readyState === 1) {
        // connected
        return conn;
      }
      // Connexion invalide, la supprimer
      this.connections.delete(tid);
    }

    // Verifier si une connexion est deja en cours
    if (this.connectionLocks.has(tid)) {
      return this.connectionLocks.get(tid)!;
    }

    // Creer la connexion
    const connectionPromise = this.createTenantConnection(tid);
    this.connectionLocks.set(tid, connectionPromise);

    try {
      const connection = await connectionPromise;
      return connection;
    } finally {
      this.connectionLocks.delete(tid);
    }
  }

  private async getMemoryConnection(tenantId: string): Promise<Connection> {
    // En mode test, tous les tenants partagent la meme base en memoire
    const cacheKey = 'memory-db';

    if (this.connections.has(cacheKey)) {
      return this.connections.get(cacheKey)!;
    }

    // Utiliser le MongoMemoryServer du test compatibility layer s'il existe
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const databaseService = require('../../../services/database-service');
    let uri = databaseService.getMemoryUri();

    if (!uri) {
      // Pas de serveur existant, en creer un nouveau
      if (!this.mongoMemoryServer) {
        this.mongoMemoryServer = await MongoMemoryServer.create();
        this.logger.log('MongoDB Memory Server demarre par NestJS');
      }
      uri = this.mongoMemoryServer.getUri();
    } else {
      this.logger.log('Reutilisation du MongoDB Memory Server existant');
    }

    const connection = createConnection(uri);

    connection.on('connected', () => {
      this.logger.log('Connexion MongoDB Memory etablie');
    });

    connection.on('error', (err) => {
      this.logger.error('Erreur MongoDB Memory', err);
    });

    this.connections.set(cacheKey, connection);
    return connection;
  }

  private async createTenantConnection(tenantId: string): Promise<Connection> {
    // Recuperer la config du tenant depuis la base admin
    const tenantConfig = await this.adminConnection.getTenantConfig(tenantId);

    if (!tenantConfig) {
      throw new NotFoundException(`Tenant ${tenantId} non trouve`);
    }

    const mongoUri = tenantConfig.mongoUri;

    const connection = createConnection(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    connection.on('connected', () => {
      this.logger.log(`Connexion tenant ${tenantId} etablie`);
    });

    connection.on('error', (err) => {
      this.logger.error(`Erreur connexion tenant ${tenantId}`, err);
    });

    connection.on('disconnected', () => {
      this.logger.warn(`Connexion tenant ${tenantId} deconnectee`);
      this.connections.delete(tenantId);
    });

    this.connections.set(tenantId, connection);
    return connection;
  }

  async getModel<T>(
    name: string,
    schema: Schema,
    tenantId?: string,
  ): Promise<Model<T>> {
    const connection = await this.getConnection(tenantId);

    // Verifier si le modele existe deja
    if (connection.models[name]) {
      return connection.model<T>(name);
    }

    return connection.model<T>(name, schema);
  }

  async isTenantValid(tenantId: string): Promise<boolean> {
    if (this.configService.get('USE_MEMORY_DB')) {
      return true;
    }

    const config = await this.adminConnection.getTenantConfig(tenantId);
    return config !== null && config.isActive;
  }

  async closeTenantConnection(tenantId: string): Promise<void> {
    const connection = this.connections.get(tenantId);
    if (connection) {
      await connection.close();
      this.connections.delete(tenantId);
      this.logger.log(`Connexion tenant ${tenantId} fermee manuellement`);
    }
  }
}
