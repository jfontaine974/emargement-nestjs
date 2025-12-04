import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ROLES_KEY, PUBLIC_KEY } from './roles.decorator';
import { TenantConnectionService } from '../database/tenant-connection.service';
import { EnvironmentVariables } from '../../config/environment.interface';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      __user?: string;
      tenantId?: string;
    }
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly tenantConnection: TenantConnectionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verifier si la route est publique
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Mode test - bypass l'authentification (comme verifyTest dans Express)
    const nodeEnv = this.configService.get('NODE_ENV');
    if (nodeEnv === 'test') {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    try {
      await this.validateRequest(request, response, requiredRoles);
      return true;
    } catch (error) {
      this.logger.warn(`Auth KO: ${error.message}`);
      throw error;
    }
  }

  private async validateRequest(
    req: Request,
    res: Response,
    roles?: string[],
  ): Promise<void> {
    const { cookies, headers } = req;

    // Verification XSRF
    const xsrfToken = headers['x-xsrf-token'] as string;
    if (!xsrfToken) {
      throw new UnauthorizedException('Manque XSRF token dans headers');
    }

    // Gestion device mobile
    const deviceId = headers['x-device-id'] as string;
    if (deviceId?.trim()) {
      (req.body as any).id_device = deviceId;
    }

    // Recuperation des tokens
    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    if ((req.body as any).id_device?.trim()) {
      // Mode mobile - tokens dans les headers
      accessToken = headers['x-access-token'] as string;
      refreshToken = headers['x-access-token'] as string;
    } else {
      // Mode web - tokens dans les cookies
      accessToken = cookies?.access_token;
      refreshToken = cookies?.refresh_token;
    }

    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException('Aucune information sur les tokens');
    }

    let verifyResult = -100;

    if (!accessToken && refreshToken) {
      // Pas d'access token, utiliser le refresh token
      const isXsrfOk = await this.authService.verifyXsrf(
        xsrfToken,
        refreshToken,
        true,
      );

      if (!isXsrfOk) {
        throw new UnauthorizedException('Bad xsrf refresh token');
      }

      verifyResult = await this.verifyTokenAndRoles(
        req,
        refreshToken,
        roles,
        true,
      );

      if (verifyResult === 0) {
        // Generer de nouveaux tokens
        const newXsrfToken = this.authService.getXsrfToken();
        const newAccessToken = await this.authService.getNewAccessToken(
          refreshToken,
          newXsrfToken,
        );
        const newRefreshToken = await this.authService.getNewRefreshToken(
          refreshToken,
          newXsrfToken,
        );
        this.authService.setCookies(res, newAccessToken, newRefreshToken);
      }
    } else if (accessToken) {
      // Utiliser l'access token
      const isXsrfOk = await this.authService.verifyXsrf(
        xsrfToken,
        accessToken,
        false,
      );

      if (!isXsrfOk) {
        throw new UnauthorizedException('Bad xsrf access token');
      }

      verifyResult = await this.verifyTokenAndRoles(
        req,
        accessToken,
        roles,
        false,
      );
    }

    this.handleVerifyResult(verifyResult);

    // Stocker l'userId dans la request
    if (accessToken || refreshToken) {
      try {
        const token = accessToken || refreshToken!;
        const userId = await this.authService.getUserIdFromToken(token);
        req.__user = userId;
      } catch {
        // Ignorer l'erreur, le token a deja ete valide
      }
    }

    // Nettoyer le body
    delete (req.body as any).userId;
    delete (req.body as any)._id;
  }

  private async verifyTokenAndRoles(
    req: Request,
    token: string,
    roles?: string[],
    isRefresh = false,
  ): Promise<number> {
    try {
      const decoded = isRefresh
        ? await this.authService.verifyRefreshToken(token)
        : await this.authService.verifyAccessToken(token);

      const userId = decoded.user._id;

      // Verifier que l'userId dans le body correspond
      if ((req.body as any).userId && (req.body as any).userId !== userId) {
        return -1;
      }

      // Verifier le device si present
      if ((req.body as any).id_device) {
        // TODO: Verifier le device dans la base
        // Pour l'instant, on considere que c'est ok
        return 0;
      }

      // Verifier les roles
      if (roles && roles.length > 0) {
        const userRole = decoded.user.role;
        if (!roles.includes(userRole)) {
          return -3;
        }
      }

      return 0;
    } catch {
      return -2;
    }
  }

  private handleVerifyResult(result: number): void {
    switch (result) {
      case -1:
        throw new UnauthorizedException('Invalid user ID - 1');
      case -2:
        throw new UnauthorizedException('Invalid user ID - 2');
      case -3:
        throw new ForbiddenException('User pas le droit');
      case -4:
        throw new UnauthorizedException('Device inconnu');
      case 0:
        return;
      default:
        throw new UnauthorizedException('Erreur authentification');
    }
  }
}
