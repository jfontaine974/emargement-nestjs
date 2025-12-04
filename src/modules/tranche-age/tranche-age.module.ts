import { Module } from '@nestjs/common';
import { TrancheAgeController } from './tranche-age.controller';
import { TrancheAgeService } from './tranche-age.service';
import { TrancheAgeRepositoryImpl } from './infrastructure/persistence/tranche-age.repository.impl';
import { TRANCHE_AGE_REPOSITORY } from './domain/tranche-age.repository';
import { DatabaseModule } from '../../shared/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TrancheAgeController],
  providers: [
    TrancheAgeService,
    {
      provide: TRANCHE_AGE_REPOSITORY,
      useClass: TrancheAgeRepositoryImpl,
    },
  ],
  exports: [TrancheAgeService],
})
export class TrancheAgeModule {}
