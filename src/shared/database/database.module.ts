import { Global, Module } from '@nestjs/common';
import { AdminConnectionService } from './admin-connection.service';
import { TenantConnectionService } from './tenant-connection.service';

@Global()
@Module({
  providers: [AdminConnectionService, TenantConnectionService],
  exports: [AdminConnectionService, TenantConnectionService],
})
export class DatabaseModule {}
