import { Module } from '@nestjs/common';
import { PeriodeController } from './periode.controller';
import { PeriodeService } from './periode.service';
import { PeriodeRepositoryImpl } from './infrastructure/persistence/periode.repository.impl';
import { PERIODE_REPOSITORY } from './domain/periode.repository';
import { DatabaseModule } from '../../shared/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PeriodeController],
  providers: [
    PeriodeService,
    {
      provide: PERIODE_REPOSITORY,
      useClass: PeriodeRepositoryImpl,
    },
  ],
  exports: [PeriodeService],
})
export class PeriodeModule {}
