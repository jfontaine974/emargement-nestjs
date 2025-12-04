import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { SharedModule } from './shared/shared.module';
import { TenantExtractionMiddleware } from './shared/tenant/tenant-extraction.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ImplantationsModule } from './modules/implantations/implantations.module';
import { TypeAccueilModule } from './modules/type-accueil/type-accueil.module';
import { TypeActiviteModule } from './modules/type-activite/type-activite.module';
import { TrancheAgeModule } from './modules/tranche-age/tranche-age.module';
import { PeriodeModule } from './modules/periode/periode.module';
import { CategoriesModule } from './modules/categories/categories.module';

@Module({
  imports: [ConfigModule, SharedModule, UsersModule, ImplantationsModule, TypeAccueilModule, TypeActiviteModule, TrancheAgeModule, PeriodeModule, CategoriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Appliquer le middleware tenant a toutes les routes sauf health check
    consumer
      .apply(TenantExtractionMiddleware)
      .exclude(
        { path: 'health', method: RequestMethod.GET },
        { path: 'api-docs', method: RequestMethod.ALL },
        { path: 'api-docs/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
