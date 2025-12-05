import { Module } from '@nestjs/common';
import { ReferentsController } from './referents.controller';
import { ReferentsService } from './referents.service';
import { ReferentRepositoryImpl } from './infrastructure/persistence/referent.repository.impl';
import { REFERENT_REPOSITORY } from './domain/referent.repository';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [ReferentsController],
  providers: [
    ReferentsService,
    {
      provide: REFERENT_REPOSITORY,
      useClass: ReferentRepositoryImpl,
    },
  ],
  exports: [ReferentsService],
})
export class ReferentsModule {}
