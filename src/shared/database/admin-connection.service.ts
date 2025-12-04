import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, createConnection, Model } from 'mongoose';
import {
  TenantConfigSchema,
  TenantConfig,
  TenantConfigDocument,
} from './schemas/tenant-config.schema';
import { EnvironmentVariables } from '../../config/environment.interface';

@Injectable()
export class AdminConnectionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AdminConnectionService.name);
  private connection: Connection | null = null;
  private TenantConfigModel: Model<TenantConfigDocument> | null = null;
  private tenantConfigCache: Map<string, TenantConfig> = new Map();

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async onModuleInit() {
    const useMemoryDb = this.configService.get('USE_MEMORY_DB');

    // En mode test avec memory DB, on n'a pas besoin de la base admin
    if (useMemoryDb) {
      this.logger.log(
        'Mode USE_MEMORY_DB actif - pas de connexion admin requise',
      );
      return;
    }

    const adminUri = this.configService.get('ADMIN_MONGO_URI');
    if (!adminUri) {
      throw new Error('ADMIN_MONGO_URI est requis en mode production');
    }

    try {
      this.connection = createConnection(adminUri);
      this.TenantConfigModel = this.connection.model<TenantConfigDocument>(
        'TenantConfig',
        TenantConfigSchema,
      );
      this.logger.log('Connexion a la base admin etablie');
    } catch (error) {
      this.logger.error('Erreur connexion base admin', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.connection) {
      await this.connection.close();
      this.logger.log('Connexion admin fermee');
    }
  }

  async getTenantConfig(tenantId: string): Promise<TenantConfig | null> {
    // Mode test - retourner une config par defaut
    if (this.configService.get('USE_MEMORY_DB')) {
      return this.getDefaultTenantConfig(tenantId);
    }

    // Verifier le cache
    if (this.tenantConfigCache.has(tenantId)) {
      return this.tenantConfigCache.get(tenantId)!;
    }

    if (!this.TenantConfigModel) {
      throw new Error('AdminConnectionService non initialise');
    }

    const config = await this.TenantConfigModel.findOne({
      tenantId,
      isActive: true,
    }).lean();

    if (config) {
      this.tenantConfigCache.set(tenantId, config as TenantConfig);
    }

    return config as TenantConfig | null;
  }

  async getAllTenants(): Promise<TenantConfig[]> {
    if (this.configService.get('USE_MEMORY_DB')) {
      return [this.getDefaultTenantConfig('test-tenant')];
    }

    if (!this.TenantConfigModel) {
      throw new Error('AdminConnectionService non initialise');
    }

    return this.TenantConfigModel.find({ isActive: true }).lean();
  }

  async createTenant(config: Partial<TenantConfig>): Promise<TenantConfig> {
    if (this.configService.get('USE_MEMORY_DB')) {
      throw new Error('Creation tenant non supportee en mode test');
    }

    if (!this.TenantConfigModel) {
      throw new Error('AdminConnectionService non initialise');
    }

    const tenant = await this.TenantConfigModel.create(config);
    return tenant.toObject();
  }

  async updateTenant(
    tenantId: string,
    config: Partial<TenantConfig>,
  ): Promise<TenantConfig | null> {
    if (this.configService.get('USE_MEMORY_DB')) {
      throw new Error('Mise a jour tenant non supportee en mode test');
    }

    if (!this.TenantConfigModel) {
      throw new Error('AdminConnectionService non initialise');
    }

    // Invalider le cache
    this.tenantConfigCache.delete(tenantId);

    const tenant = await this.TenantConfigModel.findOneAndUpdate(
      { tenantId },
      { $set: config },
      { new: true },
    ).lean();

    return tenant as TenantConfig | null;
  }

  clearCache(tenantId?: string) {
    if (tenantId) {
      this.tenantConfigCache.delete(tenantId);
    } else {
      this.tenantConfigCache.clear();
    }
  }

  private getDefaultTenantConfig(tenantId: string): TenantConfig {
    // Config par defaut pour les tests basee sur les variables d'environnement
    return {
      tenantId,
      nom: 'Test Tenant',
      mongoUri: this.configService.get('MONGO_URI') || '',
      appConfig: {
        API_ROUTE: this.configService.get('API_ROUTE'),
        EMARGEMENTS_FOLDER: this.configService.get('EMARGEMENTS_FOLDER'),
        EMARGEMENTSANIM_FOLDER: this.configService.get('EMARGEMENTSANIM_FOLDER'),
        MAX_FILE_SIZE_MO: this.configService.get('MAX_FILE_SIZE_MO'),
        NOM_ASSO: this.configService.get('NOM_ASSO'),
      },
      tokenConfig: {
        SECRET_TOKEN: this.configService.get('SECRET_TOKEN')!,
        SECRET_REFRESH_TOKEN: this.configService.get('SECRET_REFRESH_TOKEN')!,
        ACCESS_TOKEN_EXPIRE_SECOND: this.configService.get(
          'ACCESS_TOKEN_EXPIRE_SECOND',
        ),
        REFRESH_TOKEN_EXPIRE_DAY: this.configService.get(
          'REFRESH_TOKEN_EXPIRE_DAY',
        ),
        JWT_EXPIRE_HOUR: this.configService.get('JWT_EXPIRE_HOUR'),
        ALGORITHM: this.configService.get('ALGORITHM'),
      },
      passwordConfig: {
        SALT_ROUND: this.configService.get('SALT_ROUND'),
      },
      encryptionConfig: {
        ENCKEY: this.configService.get('ENCKEY')!,
        SIGKEY: this.configService.get('SIGKEY')!,
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
