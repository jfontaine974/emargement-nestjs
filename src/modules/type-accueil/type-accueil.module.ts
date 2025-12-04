import { Module } from '@nestjs/common';
import { TypeAccueilController } from './type-accueil.controller';
import { TypeAccueilService } from './type-accueil.service';
import { TypeAccueilRepositoryImpl } from './infrastructure/persistence/type-accueil.repository.impl';
import { TYPE_ACCUEIL_REPOSITORY } from './domain/type-accueil.repository';
import { DatabaseModule } from '../../shared/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TypeAccueilController],
  providers: [
    TypeAccueilService,
    {
      provide: TYPE_ACCUEIL_REPOSITORY,
      useClass: TypeAccueilRepositoryImpl,
    },
  ],
  exports: [TypeAccueilService],
})
export class TypeAccueilModule {}
