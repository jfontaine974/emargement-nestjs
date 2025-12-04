import { Injectable, Inject } from '@nestjs/common';
import { TrancheAgeRepository, TRANCHE_AGE_REPOSITORY } from './domain/tranche-age.repository';

@Injectable()
export class TrancheAgeService {
  constructor(
    @Inject(TRANCHE_AGE_REPOSITORY)
    private readonly trancheAgeRepository: TrancheAgeRepository,
  ) {}

  async listTrancheAge() {
    const tranchesAge = await this.trancheAgeRepository.findActive();
    return {
      ret: 0,
      data: tranchesAge.map((trancheAge) => trancheAge.view()),
    };
  }
}
