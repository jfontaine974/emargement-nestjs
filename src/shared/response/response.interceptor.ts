import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as crypto from 'crypto';

export interface ApiResponse<T> {
  ret: number;
  data?: T;
  hash?: string;
  xsrfToken?: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Si la reponse est deja formatee (ret existe), la retourner telle quelle
        if (data && typeof data === 'object' && 'ret' in data) {
          return data;
        }

        // Formater la reponse avec ret: 0
        const response: ApiResponse<T> = {
          ret: 0,
        };

        // Gerer le hash si demande
        if (data && typeof data === 'object' && 'hash' in data && data.hash) {
          const dataCopy = { ...data };
          delete dataCopy.hash;
          const dataString = JSON.stringify(dataCopy);
          response.hash = crypto
            .createHash('md5')
            .update(dataString)
            .digest('hex');
          response.data = dataCopy as T;
        } else {
          response.data = data;
        }

        return response;
      }),
    );
  }
}
