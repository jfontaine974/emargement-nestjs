import { TypeAccueilDocument } from '../infrastructure/persistence/type-accueil.schema';

export const TYPE_ACCUEIL_REPOSITORY = Symbol('TYPE_ACCUEIL_REPOSITORY');

export interface TypeAccueilRepository {
  findAll(): Promise<TypeAccueilDocument[]>;
  findActive(): Promise<TypeAccueilDocument[]>;
  findById(id: string): Promise<TypeAccueilDocument | null>;
  create(data: Partial<TypeAccueilDocument>): Promise<TypeAccueilDocument>;
  update(id: string, data: Partial<TypeAccueilDocument>): Promise<TypeAccueilDocument | null>;
}
