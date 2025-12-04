import { Injectable, Inject } from '@nestjs/common';
import { PeriodeRepository, PERIODE_REPOSITORY } from './domain/periode.repository';

@Injectable()
export class PeriodeService {
  constructor(
    @Inject(PERIODE_REPOSITORY)
    private readonly periodeRepository: PeriodeRepository,
  ) {}

  async listPeriode() {
    const periodes = await this.periodeRepository.findActive();
    return {
      ret: 0,
      data: periodes.map((periode) => periode.view()),
    };
  }
}
