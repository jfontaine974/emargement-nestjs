import { HttpException } from '@nestjs/common';

/**
 * Exception metier avec status 520
 * Utilisee pour les erreurs de validation et les entites non trouvees
 * Format de reponse: { ret: -1, err: string, info: string, date: string }
 */
export class BusinessException extends HttpException {
  constructor(err: string, info: string) {
    super(
      {
        ret: -1,
        err,
        info,
        date: new Date().toISOString(),
      },
      520,
    );
  }
}
