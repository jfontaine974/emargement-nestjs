import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import {
  CATEGORIE_REPOSITORY,
  CategorieRepository,
  CategorieView,
  LinkParentItem,
} from './domain/categorie.repository';
import { CategorieDocument } from './infrastructure/persistence/categorie.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(CATEGORIE_REPOSITORY)
    private readonly categorieRepository: CategorieRepository,
  ) {}

  async listCategories(): Promise<{ ret: number; data: CategorieView[] }> {
    const categories = await this.categorieRepository.findAll();
    const views = await this.categorieRepository.getCategoriesView(categories);
    return { ret: 0, data: views };
  }

  async listCategoriesFromDate(date: string): Promise<{ ret: number; data: CategorieView[] }> {
    const categories = await this.categorieRepository.findAllFromDate(date);
    const views = await this.categorieRepository.getCategoriesView(categories);
    return { ret: 0, data: views };
  }

  async listLiaisonsFromDate(
    date: string,
  ): Promise<{ ret: number; data: { id_mere: string; id_fille: string; updatedAt: Date }[] }> {
    const categories = await this.categorieRepository.findAllFromDate(date);
    const liaisons = categories
      .filter((c) => c.parent_id && c.parent_id !== '0')
      .map((c) => ({
        id_mere: c.parent_id,
        id_fille: c._id.toString(),
        updatedAt: c.updatedAt,
      }));
    return { ret: 0, data: liaisons };
  }

  async createCategorie(
    data: Partial<CategorieDocument>,
  ): Promise<{ ret: number; data: CategorieView }> {
    // Validate parent_id if provided
    if (data.parent_id && parseInt(data.parent_id, 10) !== 0) {
      const parentCate = await this.categorieRepository.findById(data.parent_id);
      if (!parentCate) {
        throw new HttpException(
          { ret: 520, message: `Id categorie ${data.parent_id} inexistant` },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Validate type_accueil_id
    if (data.type_accueil_id && String(data.type_accueil_id).trim() !== '') {
      const isValid = await this.categorieRepository.validateTypeAccueilId(
        String(data.type_accueil_id),
      );
      if (!isValid) {
        throw new HttpException(
          { ret: 520, message: `Id type d'accueil ${data.type_accueil_id} inexistant` },
          520,
        );
      }
    } else if (data.type_accueil_id === ('' as any)) {
      data.type_accueil_id = undefined;
    }

    // Validate tranche_age_id
    if (data.tranche_age_id && String(data.tranche_age_id).trim() !== '') {
      const isValid = await this.categorieRepository.validateTrancheAgeId(
        String(data.tranche_age_id),
      );
      if (!isValid) {
        throw new HttpException(
          { ret: 520, message: `Id tranche d'âge ${data.tranche_age_id} inexistant` },
          520,
        );
      }
    } else if (data.tranche_age_id === ('' as any)) {
      data.tranche_age_id = undefined;
    }

    // Validate implantation_id
    if (data.implantation_id && String(data.implantation_id).trim() !== '') {
      const isValid = await this.categorieRepository.validateImplantationId(
        String(data.implantation_id),
      );
      if (!isValid) {
        throw new HttpException(
          { ret: 520, message: `Id implantation ${data.implantation_id} inexistant` },
          520,
        );
      }
    } else if (data.implantation_id === ('' as any)) {
      data.implantation_id = undefined;
    }

    // Validate type_activite_id
    if (data.type_activite_id && String(data.type_activite_id).trim() !== '') {
      const isValid = await this.categorieRepository.validateTypeActiviteId(
        String(data.type_activite_id),
      );
      if (!isValid) {
        throw new HttpException(
          { ret: 520, message: `Id type d'activité ${data.type_activite_id} inexistant` },
          520,
        );
      }
    } else if (data.type_activite_id === ('' as any)) {
      data.type_activite_id = undefined;
    }

    // Validate periode_id
    if (data.periode_id && String(data.periode_id).trim() !== '') {
      const isValid = await this.categorieRepository.validatePeriodeId(String(data.periode_id));
      if (!isValid) {
        throw new HttpException({ ret: 520, message: `Id période ${data.periode_id} inexistant` }, 520);
      }
    } else if (data.periode_id === ('' as any)) {
      data.periode_id = undefined;
    }

    const categorie = await this.categorieRepository.create(data);
    const view = await this.categorieRepository.getCategorieView(categorie);
    return { ret: 0, data: view };
  }

  async updateCategorie(
    id: string,
    data: Partial<CategorieDocument>,
  ): Promise<{ ret: number; data: CategorieView }> {
    // Remove _id from data
    delete (data as any)._id;

    // Validate parent_id if provided
    if (data.parent_id && parseInt(data.parent_id, 10) !== 0) {
      const parentCate = await this.categorieRepository.findByIdNotDeleted(data.parent_id);
      if (!parentCate) {
        throw new HttpException(
          { ret: 520, message: `Id categorie ${data.parent_id} inexistant` },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Validate type_accueil_id
    if (data.type_accueil_id && String(data.type_accueil_id).trim() !== '') {
      const isValid = await this.categorieRepository.validateTypeAccueilId(
        String(data.type_accueil_id),
      );
      if (!isValid) {
        throw new HttpException(
          { ret: 520, message: `Id type d'accueil ${data.type_accueil_id} inexistant` },
          520,
        );
      }
    } else if (data.type_accueil_id === ('' as any)) {
      data.type_accueil_id = undefined;
    }

    // Validate tranche_age_id
    if (data.tranche_age_id && String(data.tranche_age_id).trim() !== '') {
      const isValid = await this.categorieRepository.validateTrancheAgeId(
        String(data.tranche_age_id),
      );
      if (!isValid) {
        throw new HttpException(
          { ret: 520, message: `Id tranche d'âge ${data.tranche_age_id} inexistant` },
          520,
        );
      }
    } else if (data.tranche_age_id === ('' as any)) {
      data.tranche_age_id = undefined;
    }

    // Validate implantation_id
    if (data.implantation_id && String(data.implantation_id).trim() !== '') {
      const isValid = await this.categorieRepository.validateImplantationId(
        String(data.implantation_id),
      );
      if (!isValid) {
        throw new HttpException(
          { ret: 520, message: `Id implantation ${data.implantation_id} inexistant` },
          520,
        );
      }
    } else if (data.implantation_id === ('' as any)) {
      data.implantation_id = undefined;
    }

    // Validate type_activite_id
    if (data.type_activite_id && String(data.type_activite_id).trim() !== '') {
      const isValid = await this.categorieRepository.validateTypeActiviteId(
        String(data.type_activite_id),
      );
      if (!isValid) {
        throw new HttpException(
          { ret: 520, message: `Id type d'activité ${data.type_activite_id} inexistant` },
          520,
        );
      }
    } else if (data.type_activite_id === ('' as any)) {
      data.type_activite_id = undefined;
    }

    // Validate periode_id
    if (data.periode_id && String(data.periode_id).trim() !== '') {
      const isValid = await this.categorieRepository.validatePeriodeId(String(data.periode_id));
      if (!isValid) {
        throw new HttpException({ ret: 520, message: `Id période ${data.periode_id} inexistant` }, 520);
      }
    } else if (data.periode_id === ('' as any)) {
      data.periode_id = undefined;
    }

    const categorie = await this.categorieRepository.update(id, data);
    if (!categorie) {
      throw new HttpException({ ret: 520, message: 'Aucun update fait' }, HttpStatus.BAD_REQUEST);
    }
    const view = await this.categorieRepository.getCategorieView(categorie);
    return { ret: 0, data: view };
  }

  async updateListCategories(
    dataList: Partial<CategorieDocument>[],
  ): Promise<{ ret: number; data: CategorieView[] }> {
    const results: CategorieView[] = [];
    for (const data of dataList) {
      const id = (data as any)._id;
      if (parseInt(data.parent_id || '0', 10) !== 0) {
        const parentCate = await this.categorieRepository.findById(data.parent_id!);
        if (!parentCate) {
          throw new HttpException(
            { ret: 520, message: `Id categorie ${data.parent_id} inexistant` },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      delete (data as any)._id;
      const categorie = await this.categorieRepository.update(id, data);
      if (categorie) {
        const view = await this.categorieRepository.getCategorieView(categorie);
        results.push(view);
      }
    }
    return { ret: 0, data: results };
  }

  async linkParent(list: LinkParentItem[]): Promise<{ ret: number; data: CategorieView[] }> {
    const results: CategorieView[] = [];
    for (const item of list) {
      if (parseInt(item.parent_id, 10) !== 0) {
        const parentCate = await this.categorieRepository.findById(item.parent_id);
        if (!parentCate) {
          throw new HttpException(
            { ret: 520, message: `Id categorie ${item.parent_id} inexistant` },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      const categorie = await this.categorieRepository.update(item.id, {
        parent_id: item.parent_id,
      });
      if (categorie) {
        const view = await this.categorieRepository.getCategorieView(categorie);
        results.push(view);
      }
    }
    return { ret: 0, data: results };
  }

  async disableCategorie(id: string): Promise<{ ret: number; data: CategorieView[] }> {
    const categorie = await this.categorieRepository.findByIdNotDeleted(id);
    if (!categorie) {
      throw new HttpException({ ret: 520, message: 'Categorie non trouvée' }, HttpStatus.NOT_FOUND);
    }

    const allCategories = await this.categorieRepository.getChildrenRecursive(categorie, [
      categorie,
    ]);
    const results: CategorieView[] = [];

    for (const cat of allCategories) {
      const updated = await this.categorieRepository.update(cat._id.toString(), { life_cycle: 9 });
      if (updated) {
        const view = await this.categorieRepository.getCategorieView(updated);
        results.push(view);
      }
    }

    return { ret: 0, data: results };
  }

  async enableCategorie(id: string): Promise<{ ret: number; data: CategorieView[] }> {
    const categorie = await this.categorieRepository.findByIdWithLifeCycle(id, 9);
    if (!categorie) {
      throw new HttpException({ ret: 520, message: 'Categorie non trouvée' }, HttpStatus.NOT_FOUND);
    }

    const allCategories = await this.categorieRepository.getChildrenRecursive(categorie, [
      categorie,
    ]);
    const results: CategorieView[] = [];

    for (const cat of allCategories) {
      const updated = await this.categorieRepository.update(cat._id.toString(), { life_cycle: 0 });
      if (updated) {
        const view = await this.categorieRepository.getCategorieView(updated);
        results.push(view);
      }
    }

    return { ret: 0, data: results };
  }

  async duplicateCategorie(id: string): Promise<{ ret: number; data: CategorieView[] }> {
    const categorie = await this.categorieRepository.findByIdNotDeleted(id);
    if (!categorie) {
      throw new HttpException({ ret: 520, message: 'Categorie non trouvée' }, HttpStatus.NOT_FOUND);
    }

    const allCategories = await this.categorieRepository.getChildrenRecursive(categorie, [
      categorie,
    ]);
    const copyRes = JSON.parse(JSON.stringify(allCategories.map((e) => e.view())));
    const results: CategorieView[] = [];

    for (let i = 0; i < copyRes.length; i++) {
      const nCate = copyRes[i];
      if (categorie._id.toString() === nCate._id) {
        copyRes[i].nom = copyRes[i].nom + '_copie';
        copyRes[i].parent_id = '0';
      }
      const idOrigin = copyRes[i]._id;
      delete copyRes[i]._id;
      delete copyRes[i].createdAt;
      delete copyRes[i].updatedAt;

      const newCategorie = await this.categorieRepository.create(copyRes[i]);
      const view = await this.categorieRepository.getCategorieView(newCategorie);
      results.push(view);

      // Update parent_id references for children
      for (let j = 0; j < copyRes.length; j++) {
        if (copyRes[j].parent_id === idOrigin) {
          copyRes[j].parent_id = newCategorie._id.toString();
        }
      }
    }

    return { ret: 0, data: results };
  }

  async updateTree(
    id: string,
    data: Record<string, any>,
    listId: string[],
  ): Promise<{ ret: number; data: CategorieView[] }> {
    const results: CategorieView[] = [];

    // Update nom on the main category if provided
    if (data.nom) {
      const updated = await this.categorieRepository.update(id, { nom: data.nom });
      if (updated) {
        const view = await this.categorieRepository.getCategorieView(updated);
        results.push(view);
      }
      delete data.nom;
    }

    // Update all children with the remaining data
    const isEmptyData = Object.keys(data).length === 0;
    if (!isEmptyData) {
      for (const childId of listId) {
        const updated = await this.categorieRepository.update(childId, data);
        if (updated) {
          const view = await this.categorieRepository.getCategorieView(updated);
          results.push(view);
        }
      }
    }

    return { ret: 0, data: results };
  }

  async getSubCategories(
    id: string,
  ): Promise<{ ret: number; data: Record<string, unknown>[] }> {
    const categorie = await this.categorieRepository.findByIdNotDeleted(id);
    if (!categorie) {
      throw new HttpException({ ret: 520, message: 'Categorie non trouvée' }, HttpStatus.NOT_FOUND);
    }

    const allCategories = await this.categorieRepository.getChildrenRecursive(categorie, [
      categorie,
    ]);
    return { ret: 0, data: allCategories.map((c) => c.view()) };
  }
}
