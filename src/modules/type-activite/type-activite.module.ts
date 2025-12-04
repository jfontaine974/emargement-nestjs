import { Module } from '@nestjs/common';
import { TypeActiviteController } from './type-activite.controller';
import { TypeActiviteService } from './type-activite.service';
import { TypeActiviteRepositoryImpl } from './infrastructure/persistence/type-activite.repository.impl';
import { TYPE_ACTIVITE_REPOSITORY } from './domain/type-activite.repository';
import { DatabaseModule } from '../../shared/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TypeActiviteController],
  providers: [
    TypeActiviteService,
    {
      provide: TYPE_ACTIVITE_REPOSITORY,
      useClass: TypeActiviteRepositoryImpl,
    },
  ],
  exports: [TypeActiviteService],
})
export class TypeActiviteModule {}
