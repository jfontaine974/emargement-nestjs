import { Module } from '@nestjs/common';
import { ImplantationsController } from './implantations.controller';
import { ImplantationsService } from './implantations.service';
import { IMPLANTATION_REPOSITORY } from './domain/implantation.repository';
import { ImplantationRepositoryImpl } from './infrastructure/persistence/implantation.repository.impl';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [ImplantationsController],
  providers: [
    ImplantationsService,
    {
      provide: IMPLANTATION_REPOSITORY,
      useClass: ImplantationRepositoryImpl,
    },
  ],
  exports: [ImplantationsService],
})
export class ImplantationsModule {}
