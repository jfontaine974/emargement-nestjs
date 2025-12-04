import { CategorieDocument } from '../infrastructure/persistence/categorie.schema';

export interface CategorieView {
  categorie: Record<string, unknown>;
  childs_id: string[];
  users_id: string[];
}

export interface LinkParentItem {
  id: string;
  parent_id: string;
}

export const CATEGORIE_REPOSITORY = 'CATEGORIE_REPOSITORY';

export interface CategorieRepository {
  findAll(): Promise<CategorieDocument[]>;
  findAllFromDate(date: string): Promise<CategorieDocument[]>;
  findById(id: string): Promise<CategorieDocument | null>;
  findByIdNotDeleted(id: string): Promise<CategorieDocument | null>;
  findByIdWithLifeCycle(id: string, lifeCycle: number): Promise<CategorieDocument | null>;
  findChildrenByParentId(parentId: string): Promise<CategorieDocument[]>;
  create(data: Partial<CategorieDocument>): Promise<CategorieDocument>;
  update(id: string, data: Partial<CategorieDocument>): Promise<CategorieDocument | null>;
  getEnfantCategoriesByCategorie(categorieId: string): Promise<string[]>;
  getUserCategoriesByCategorie(categorieId: string): Promise<string[]>;
  getInactiveEnfantIds(): Promise<string[]>;
  getCategorieView(categorie: CategorieDocument): Promise<CategorieView>;
  getCategoriesView(categories: CategorieDocument[]): Promise<CategorieView[]>;
  getChildrenRecursive(categorie: CategorieDocument, accumulated: CategorieDocument[]): Promise<CategorieDocument[]>;
  validateTypeAccueilId(id: string): Promise<boolean>;
  validateTrancheAgeId(id: string): Promise<boolean>;
  validateImplantationId(id: string): Promise<boolean>;
  validateTypeActiviteId(id: string): Promise<boolean>;
  validatePeriodeId(id: string): Promise<boolean>;
}
