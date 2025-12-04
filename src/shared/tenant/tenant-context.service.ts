import { Injectable, Scope } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { TenantConfig } from '../database/schemas/tenant-config.schema';

interface TenantStore {
  tenantId: string;
  config?: TenantConfig;
}

@Injectable({ scope: Scope.DEFAULT })
export class TenantContextService {
  private static asyncLocalStorage = new AsyncLocalStorage<TenantStore>();

  setTenantId(tenantId: string): void {
    const store = TenantContextService.asyncLocalStorage.getStore();
    if (store) {
      store.tenantId = tenantId;
    }
  }

  getTenantId(): string | undefined {
    const store = TenantContextService.asyncLocalStorage.getStore();
    return store?.tenantId;
  }

  requireTenantId(): string {
    const tenantId = this.getTenantId();
    if (!tenantId) {
      throw new Error('Tenant ID non defini dans le contexte');
    }
    return tenantId;
  }

  setTenantConfig(config: TenantConfig): void {
    const store = TenantContextService.asyncLocalStorage.getStore();
    if (store) {
      store.config = config;
    }
  }

  getTenantConfig(): TenantConfig | undefined {
    const store = TenantContextService.asyncLocalStorage.getStore();
    return store?.config;
  }

  run<T>(tenantId: string, fn: () => T | Promise<T>): T | Promise<T> {
    return TenantContextService.asyncLocalStorage.run({ tenantId }, fn);
  }

  runWithConfig<T>(
    tenantId: string,
    config: TenantConfig,
    fn: () => T | Promise<T>,
  ): T | Promise<T> {
    return TenantContextService.asyncLocalStorage.run(
      { tenantId, config },
      fn,
    );
  }

  isInContext(): boolean {
    return TenantContextService.asyncLocalStorage.getStore() !== undefined;
  }
}
