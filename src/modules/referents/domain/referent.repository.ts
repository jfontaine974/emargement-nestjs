import { ReferentDocument } from '../infrastructure/persistence/referent.schema';

export const REFERENT_REPOSITORY = 'REFERENT_REPOSITORY';

export interface ReferentRepository {
  findAll(): Promise<ReferentDocument[]>;
  findAllFromDate(date: string): Promise<ReferentDocument[]>;
  findById(id: string): Promise<ReferentDocument | null>;
  create(data: Partial<ReferentDocument>): Promise<ReferentDocument>;
  update(id: string, data: Partial<ReferentDocument>): Promise<ReferentDocument | null>;
  disable(id: string): Promise<ReferentDocument | null>;
  delete(id: string): Promise<ReferentDocument | null>;
}
