import { PeriodeDocument } from '../infrastructure/persistence/periode.schema';

export const PERIODE_REPOSITORY = Symbol('PERIODE_REPOSITORY');

export interface PeriodeRepository {
  findAll(): Promise<PeriodeDocument[]>;
  findActive(): Promise<PeriodeDocument[]>;
  findById(id: string): Promise<PeriodeDocument | null>;
  create(data: Partial<PeriodeDocument>): Promise<PeriodeDocument>;
  update(id: string, data: Partial<PeriodeDocument>): Promise<PeriodeDocument | null>;
}
