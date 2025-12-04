import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import moment from 'moment';
import { TenantContextService } from '../tenant/tenant-context.service';
import { AdminConnectionService } from '../database/admin-connection.service';
import { EnvironmentVariables } from '../../config/environment.interface';

export interface TokenConfig {
  SECRET_TOKEN: string;
  SECRET_REFRESH_TOKEN: string;
  ACCESS_TOKEN_EXPIRE_SECOND: number;
  REFRESH_TOKEN_EXPIRE_DAY: number;
  JWT_EXPIRE_HOUR: number;
  ALGORITHM: string;
}

export interface UserPayload {
  _id: string;
  identifiant: string;
  nom?: string;
  prenom?: string;
  email?: string;
  role: string;
}

export interface TokenPayload {
  userId: string;
  user: UserPayload;
  ty: string;
  isMobileApp: boolean;
  deo: number;
  xsrfToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly tenantContext: TenantContextService,
    private readonly adminConnection: AdminConnectionService,
  ) {}

  async getTokenConfig(): Promise<TokenConfig> {
    // Mode test - utiliser les variables d'environnement
    if (this.configService.get('USE_MEMORY_DB')) {
      return {
        SECRET_TOKEN: this.configService.get('SECRET_TOKEN')!,
        SECRET_REFRESH_TOKEN: this.configService.get('SECRET_REFRESH_TOKEN')!,
        ACCESS_TOKEN_EXPIRE_SECOND:
          this.configService.get('ACCESS_TOKEN_EXPIRE_SECOND') || 3600,
        REFRESH_TOKEN_EXPIRE_DAY:
          this.configService.get('REFRESH_TOKEN_EXPIRE_DAY') || 7,
        JWT_EXPIRE_HOUR: this.configService.get('JWT_EXPIRE_HOUR') || 1,
        ALGORITHM: this.configService.get('ALGORITHM') || 'HS256',
      };
    }

    // Mode production - utiliser la config du tenant
    const tenantConfig = this.tenantContext.getTenantConfig();
    if (tenantConfig?.tokenConfig) {
      return {
        SECRET_TOKEN: tenantConfig.tokenConfig.SECRET_TOKEN,
        SECRET_REFRESH_TOKEN: tenantConfig.tokenConfig.SECRET_REFRESH_TOKEN,
        ACCESS_TOKEN_EXPIRE_SECOND:
          tenantConfig.tokenConfig.ACCESS_TOKEN_EXPIRE_SECOND || 3600,
        REFRESH_TOKEN_EXPIRE_DAY:
          tenantConfig.tokenConfig.REFRESH_TOKEN_EXPIRE_DAY || 7,
        JWT_EXPIRE_HOUR: tenantConfig.tokenConfig.JWT_EXPIRE_HOUR || 1,
        ALGORITHM: tenantConfig.tokenConfig.ALGORITHM || 'HS256',
      };
    }

    // Fallback aux variables d'environnement
    return {
      SECRET_TOKEN: this.configService.get('SECRET_TOKEN')!,
      SECRET_REFRESH_TOKEN: this.configService.get('SECRET_REFRESH_TOKEN')!,
      ACCESS_TOKEN_EXPIRE_SECOND:
        this.configService.get('ACCESS_TOKEN_EXPIRE_SECOND') || 3600,
      REFRESH_TOKEN_EXPIRE_DAY:
        this.configService.get('REFRESH_TOKEN_EXPIRE_DAY') || 7,
      JWT_EXPIRE_HOUR: this.configService.get('JWT_EXPIRE_HOUR') || 1,
      ALGORITHM: this.configService.get('ALGORITHM') || 'HS256',
    };
  }

  getXsrfToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  async getAccessToken(
    user: UserPayload,
    isMobileApp: boolean,
    xsrfToken: string,
  ): Promise<string> {
    const config = await this.getTokenConfig();
    return this.createToken(user, isMobileApp, xsrfToken, config.SECRET_TOKEN, config);
  }

  async getRefreshToken(
    user: UserPayload,
    isMobileApp: boolean,
    xsrfToken: string,
  ): Promise<string> {
    const config = await this.getTokenConfig();
    return this.createToken(
      user,
      isMobileApp,
      xsrfToken,
      config.SECRET_REFRESH_TOKEN,
      config,
    );
  }

  private createToken(
    user: UserPayload,
    isMobileApp: boolean,
    xsrfToken: string,
    secret: string,
    config: TokenConfig,
  ): string {
    const payload: TokenPayload = {
      userId: user._id,
      user,
      ty: crypto.randomBytes(64).toString('hex'),
      isMobileApp,
      deo: moment().add(config.JWT_EXPIRE_HOUR, 'hours').unix(),
      xsrfToken,
    };

    return jwt.sign(payload, secret, {
      algorithm: config.ALGORITHM as jwt.Algorithm,
    });
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    const config = await this.getTokenConfig();
    return jwt.verify(token, config.SECRET_TOKEN) as TokenPayload;
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    const config = await this.getTokenConfig();
    return jwt.verify(token, config.SECRET_REFRESH_TOKEN) as TokenPayload;
  }

  async verifyXsrf(
    xsrfToken: string,
    token: string,
    isRefresh = false,
  ): Promise<boolean> {
    try {
      const config = await this.getTokenConfig();
      const secret = isRefresh
        ? config.SECRET_REFRESH_TOKEN
        : config.SECRET_TOKEN;
      const decoded = jwt.verify(token, secret) as TokenPayload;
      return xsrfToken === decoded.xsrfToken;
    } catch {
      return false;
    }
  }

  async getNewAccessToken(
    refreshToken: string,
    newXsrfToken: string,
  ): Promise<string> {
    const config = await this.getTokenConfig();
    const decoded = jwt.verify(
      refreshToken,
      config.SECRET_REFRESH_TOKEN,
    ) as TokenPayload;

    const payload: TokenPayload = {
      userId: decoded.userId,
      user: decoded.user,
      ty: crypto.randomBytes(64).toString('hex'),
      isMobileApp: decoded.isMobileApp,
      deo: moment().add(config.JWT_EXPIRE_HOUR, 'hours').unix(),
      xsrfToken: newXsrfToken,
    };

    return jwt.sign(payload, config.SECRET_TOKEN, {
      algorithm: config.ALGORITHM as jwt.Algorithm,
    });
  }

  async getNewRefreshToken(
    refreshToken: string,
    newXsrfToken: string,
  ): Promise<string> {
    const config = await this.getTokenConfig();
    const decoded = jwt.verify(
      refreshToken,
      config.SECRET_REFRESH_TOKEN,
    ) as TokenPayload;

    const payload: TokenPayload = {
      userId: decoded.userId,
      user: decoded.user,
      ty: crypto.randomBytes(64).toString('hex'),
      isMobileApp: decoded.isMobileApp,
      deo: moment().add(config.JWT_EXPIRE_HOUR, 'hours').unix(),
      xsrfToken: newXsrfToken,
    };

    return jwt.sign(payload, config.SECRET_REFRESH_TOKEN, {
      algorithm: config.ALGORITHM as jwt.Algorithm,
    });
  }

  async getUserIdFromToken(token: string): Promise<string> {
    const config = await this.getTokenConfig();
    const decoded = jwt.verify(token, config.SECRET_TOKEN) as TokenPayload;
    return decoded.userId;
  }

  setCookies(
    res: any,
    accessToken: string,
    refreshToken: string,
  ): void {
    const isProduction =
      this.configService.get('NODE_ENV') === 'production';

    this.getTokenConfig().then((config) => {
      res.cookie('access_token', accessToken, {
        httpOnly: isProduction,
        secure: isProduction,
        maxAge: config.ACCESS_TOKEN_EXPIRE_SECOND * 1000,
      });
      res.cookie('refresh_token', refreshToken, {
        httpOnly: isProduction,
        secure: isProduction,
        maxAge: config.REFRESH_TOKEN_EXPIRE_DAY * 24 * 60 * 60 * 1000,
      });
    });
  }
}
