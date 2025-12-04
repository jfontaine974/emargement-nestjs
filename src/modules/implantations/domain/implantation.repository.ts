import { ImplantationDocument } from '../infrastructure/persistence/implantation.schema';

export const IMPLANTATION_REPOSITORY = 'IMPLANTATION_REPOSITORY';

export interface ImplantationRepository {
  findAll(): Promise<ImplantationDocument[]>;
  findById(id: string): Promise<ImplantationDocument | null>;
  create(data: Partial<ImplantationDocument>): Promise<ImplantationDocument>;
  update(id: string, data: Partial<ImplantationDocument>): Promise<ImplantationDocument | null>;
}
