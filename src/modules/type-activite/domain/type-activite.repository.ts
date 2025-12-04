import { TypeActiviteDocument } from '../infrastructure/persistence/type-activite.schema';

export const TYPE_ACTIVITE_REPOSITORY = Symbol('TYPE_ACTIVITE_REPOSITORY');

export interface TypeActiviteRepository {
  findAll(): Promise<TypeActiviteDocument[]>;
  findActive(): Promise<TypeActiviteDocument[]>;
  findById(id: string): Promise<TypeActiviteDocument | null>;
  create(data: Partial<TypeActiviteDocument>): Promise<TypeActiviteDocument>;
  update(id: string, data: Partial<TypeActiviteDocument>): Promise<TypeActiviteDocument | null>;
}
