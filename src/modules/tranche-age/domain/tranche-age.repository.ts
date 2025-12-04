import { TrancheAgeDocument } from '../infrastructure/persistence/tranche-age.schema';

export const TRANCHE_AGE_REPOSITORY = Symbol('TRANCHE_AGE_REPOSITORY');

export interface TrancheAgeRepository {
  findAll(): Promise<TrancheAgeDocument[]>;
  findActive(): Promise<TrancheAgeDocument[]>;
  findById(id: string): Promise<TrancheAgeDocument | null>;
  create(data: Partial<TrancheAgeDocument>): Promise<TrancheAgeDocument>;
  update(id: string, data: Partial<TrancheAgeDocument>): Promise<TrancheAgeDocument | null>;
}
