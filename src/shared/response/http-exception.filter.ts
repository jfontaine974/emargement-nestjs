import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { EnvironmentVariables } from '../../config/environment.interface';

export interface ErrorResponse {
  ret: number;
  err: string;
  info?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let info: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any;
        // Gerer le format BusinessException { ret, err, info, date }
        if (resp.ret !== undefined && resp.err !== undefined) {
          // C'est une BusinessException, retourner directement sa reponse
          response.status(status).json(resp);
          return;
        }
        message = resp.message || resp.error || 'Error';
        info = Array.isArray(resp.message)
          ? resp.message.join(', ')
          : resp.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      info = exception.stack;
    }

    const debug = this.configService.get('DEBUG');

    if (debug) {
      const date = new Date();
      const datetime = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
      this.logger.error(`******`);
      this.logger.error(`ret = -1`);
      this.logger.error(`err = ${message}`);
      this.logger.error(`info = ${info}`);
      this.logger.error(`datetime = ${datetime}`);
      this.logger.error(`******`);
    }

    const errorResponse: ErrorResponse = {
      ret: -1,
      err: message,
    };

    if (info && debug) {
      errorResponse.info = info;
    }

    // Utiliser status 520 pour les erreurs applicatives (comme dans Express)
    // sauf pour les erreurs 401/403
    const responseStatus =
      status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN
        ? status
        : 520;

    response.status(responseStatus).json(errorResponse);
  }
}
