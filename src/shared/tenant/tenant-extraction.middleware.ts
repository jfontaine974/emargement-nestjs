import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { TenantContextService } from './tenant-context.service';
import { TenantConnectionService } from '../database/tenant-connection.service';
import { AdminConnectionService } from '../database/admin-connection.service';
import { EnvironmentVariables } from '../../config/environment.interface';

// Extend Express Request to include tenant info
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

@Injectable()
export class TenantExtractionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantExtractionMiddleware.name);

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly tenantContext: TenantContextService,
    private readonly tenantConnection: TenantConnectionService,
    private readonly adminConnection: AdminConnectionService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Mode test single-tenant
    if (this.configService.get('USE_MEMORY_DB')) {
      const defaultTenant = 'test-tenant';
      req.tenantId = defaultTenant;
      this.tenantConnection.setCurrentTenant(defaultTenant);

      // Executer dans le contexte AsyncLocalStorage
      return this.tenantContext.run(defaultTenant, () => {
        return next();
      });
    }

    // Extraction du tenant depuis le header X-Tenant-Id (injecte par nginx)
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      this.logger.warn('Header X-Tenant-Id manquant');
      throw new BadRequestException(
        'Header X-Tenant-Id requis. Verifiez la configuration nginx.',
      );
    }

    // Valider que le tenant existe
    const isValid = await this.tenantConnection.isTenantValid(tenantId);
    if (!isValid) {
      this.logger.warn(`Tenant invalide: ${tenantId}`);
      throw new BadRequestException(`Tenant ${tenantId} non trouve ou inactif`);
    }

    // Recuperer la config du tenant pour la stocker dans le contexte
    const tenantConfig = await this.adminConnection.getTenantConfig(tenantId);

    // Stocker le tenant dans la request et dans le service
    req.tenantId = tenantId;
    this.tenantConnection.setCurrentTenant(tenantId);

    // Executer le reste de la requete dans le contexte AsyncLocalStorage
    if (tenantConfig) {
      return this.tenantContext.runWithConfig(tenantId, tenantConfig, () => {
        return next();
      });
    }

    return this.tenantContext.run(tenantId, () => {
      return next();
    });
  }
}
