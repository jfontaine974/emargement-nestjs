import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { TenantModule } from './tenant/tenant.module';
import { AuthModule } from './auth/auth.module';
import { ResponseModule } from './response/response.module';

@Module({
  imports: [DatabaseModule, TenantModule, AuthModule, ResponseModule],
  exports: [DatabaseModule, TenantModule, AuthModule, ResponseModule],
})
export class SharedModule {}
