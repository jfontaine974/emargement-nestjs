import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { TenantConnectionService } from '../../../../shared/database/tenant-connection.service';
import { CategorieRepository, CategorieView } from '../../domain/categorie.repository';
import { CategorieDocument, CategorieSchema } from './categorie.schema';
import { EnfantCategorieDocument, EnfantCategorieSchema } from './enfant-categorie.schema';
import { UserCategorieDocument, UserCategorieSchema } from './user-categorie.schema';

@Injectable()
export class CategorieRepositoryImpl implements CategorieRepository {
  constructor(private readonly tenantConnection: TenantConnectionService) {}

  private async getModel(): Promise<Model<CategorieDocument>> {
    return this.tenantConnection.getModel<CategorieDocument>('Categorie', CategorieSchema);
  }

  private async getEnfantCategorieModel(): Promise<Model<EnfantCategorieDocument>> {
    return this.tenantConnection.getModel<EnfantCategorieDocument>(
      'enfant-categorie',
      EnfantCategorieSchema,
    );
  }

  private async getUserCategorieModel(): Promise<Model<UserCategorieDocument>> {
    return this.tenantConnection.getModel<UserCategorieDocument>(
      'user-categorie',
      UserCategorieSchema,
    );
  }

  private async getEnfantModel(): Promise<Model<any>> {
    const { Schema } = require('mongoose');
    const schema = new Schema({
      life_cycle: { type: Number, default: 0 },
    }, { collection: 'enfants' });
    return this.tenantConnection.getModel('Enfant', schema);
  }

  async findAll(): Promise<CategorieDocument[]> {
    const Model = await this.getModel();
    return Model.find({
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    })
      .sort({ createdAt: 1 })
      .exec();
  }

  async findAllFromDate(date: string): Promise<CategorieDocument[]> {
    const Model = await this.getModel();
    return Model.find({
      updatedAt: { $gt: new Date(date) },
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    }).exec();
  }

  async findById(id: string): Promise<CategorieDocument | null> {
    const Model = await this.getModel();
    return Model.findById(id).exec();
  }

  async findByIdNotDeleted(id: string): Promise<CategorieDocument | null> {
    const Model = await this.getModel();
    return Model.findOne({
      _id: id,
      life_cycle: { $ne: 9 },
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    }).exec();
  }

  async findByIdWithLifeCycle(id: string, lifeCycle: number): Promise<CategorieDocument | null> {
    const Model = await this.getModel();
    return Model.findOne({
      _id: id,
      life_cycle: lifeCycle,
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    }).exec();
  }

  async findChildrenByParentId(parentId: string): Promise<CategorieDocument[]> {
    const Model = await this.getModel();
    return Model.find({
      parent_id: parentId,
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    }).exec();
  }

  async create(data: Partial<CategorieDocument>): Promise<CategorieDocument> {
    const Model = await this.getModel();
    const categorie = new Model(data);
    return categorie.save();
  }

  async update(id: string, data: Partial<CategorieDocument>): Promise<CategorieDocument | null> {
    const Model = await this.getModel();
    return Model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async getEnfantCategoriesByCategorie(categorieId: string): Promise<string[]> {
    const Model = await this.getEnfantCategorieModel();
    const enfantCategories = await Model.find({ id_categorie: categorieId, life_cycle: 0 }).exec();
    return enfantCategories.map((ec) => ec.id_enfant);
  }

  async getUserCategoriesByCategorie(categorieId: string): Promise<string[]> {
    const Model = await this.getUserCategorieModel();
    const userCategories = await Model.find({ id_categorie: categorieId, life_cycle: 0 }).exec();
    return userCategories.map((uc) => uc.id_user);
  }

  async getInactiveEnfantIds(): Promise<string[]> {
    try {
      const Model = await this.getEnfantModel();
      const enfants = await Model.find({ life_cycle: 9 }).exec();
      return enfants.map((e: any) => e._id.toString());
    } catch {
      return [];
    }
  }

  async getCategorieView(categorie: CategorieDocument): Promise<CategorieView> {
    const childsId = await this.getEnfantCategoriesByCategorie(categorie._id.toString());
    const inactiveChildsId = await this.getInactiveEnfantIds();
    const usersId = await this.getUserCategoriesByCategorie(categorie._id.toString());
    const childsIdActive = childsId.filter((id) => !inactiveChildsId.includes(id));

    return {
      categorie: categorie.view(),
      childs_id: childsIdActive,
      users_id: usersId,
    };
  }

  async getCategoriesView(categories: CategorieDocument[]): Promise<CategorieView[]> {
    const inactiveChildsId = await this.getInactiveEnfantIds();
    return Promise.all(
      categories.map(async (categorie) => {
        const childsId = await this.getEnfantCategoriesByCategorie(categorie._id.toString());
        const usersId = await this.getUserCategoriesByCategorie(categorie._id.toString());
        const childsIdActive = childsId.filter((id) => !inactiveChildsId.includes(id));

        return {
          categorie: categorie.view(),
          childs_id: childsIdActive,
          users_id: usersId,
        };
      }),
    );
  }

  async getChildrenRecursive(
    categorie: CategorieDocument,
    accumulated: CategorieDocument[],
  ): Promise<CategorieDocument[]> {
    const children = await this.findChildrenByParentId(categorie._id.toString());
    if (children.length > 0) {
      const uniqueSet = new Set([...accumulated, ...children]);
      let result = Array.from(uniqueSet);
      for (const child of children) {
        const subChildren = await this.getChildrenRecursive(child, result);
        result = Array.from(new Set([...result, ...subChildren]));
      }
      return result;
    }
    return accumulated;
  }

  async validateTypeAccueilId(id: string): Promise<boolean> {
    try {
      const { Schema } = require('mongoose');
      const schema = new Schema({ nom: String }, { collection: 'typeaccueils' });
      const Model = await this.tenantConnection.getModel('TypeAccueil_Validation', schema);
      const doc = await Model.findById(id).exec();
      return !!doc;
    } catch {
      return false;
    }
  }

  async validateTrancheAgeId(id: string): Promise<boolean> {
    try {
      const { Schema } = require('mongoose');
      const schema = new Schema({ nom: String }, { collection: 'trancheages' });
      const Model = await this.tenantConnection.getModel('TrancheAge_Validation', schema);
      const doc = await Model.findById(id).exec();
      return !!doc;
    } catch {
      return false;
    }
  }

  async validateImplantationId(id: string): Promise<boolean> {
    try {
      const { Schema } = require('mongoose');
      const schema = new Schema({ nom: String }, { collection: 'implantations' });
      const Model = await this.tenantConnection.getModel('Implantation_Validation', schema);
      const doc = await Model.findById(id).exec();
      return !!doc;
    } catch {
      return false;
    }
  }

  async validateTypeActiviteId(id: string): Promise<boolean> {
    try {
      const { Schema } = require('mongoose');
      const schema = new Schema({ nom: String }, { collection: 'typeactivites' });
      const Model = await this.tenantConnection.getModel('TypeActivite_Validation', schema);
      const doc = await Model.findById(id).exec();
      return !!doc;
    } catch {
      return false;
    }
  }

  async validatePeriodeId(id: string): Promise<boolean> {
    try {
      const { Schema } = require('mongoose');
      const schema = new Schema({ nom: String }, { collection: 'periodes' });
      const Model = await this.tenantConnection.getModel('Periode_Validation', schema);
      const doc = await Model.findById(id).exec();
      return !!doc;
    } catch {
      return false;
    }
  }
}
