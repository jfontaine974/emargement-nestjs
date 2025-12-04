import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategorieRepositoryImpl } from './infrastructure/persistence/categorie.repository.impl';
import { CATEGORIE_REPOSITORY } from './domain/categorie.repository';
import { DatabaseModule } from '../../shared/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    {
      provide: CATEGORIE_REPOSITORY,
      useClass: CategorieRepositoryImpl,
    },
  ],
  exports: [CategoriesService],
})
export class CategoriesModule {}
