import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { TenantConnectionService } from '../../../../shared/database/tenant-connection.service';
import { TypeActiviteRepository } from '../../domain/type-activite.repository';
import { TypeActiviteDocument, TypeActiviteSchema } from './type-activite.schema';

@Injectable()
export class TypeActiviteRepositoryImpl implements TypeActiviteRepository {
  constructor(private readonly tenantConnection: TenantConnectionService) {}

  private async getModel(): Promise<Model<TypeActiviteDocument>> {
    return this.tenantConnection.getModel<TypeActiviteDocument>('TypeActivite', TypeActiviteSchema);
  }

  async findAll(): Promise<TypeActiviteDocument[]> {
    const Model = await this.getModel();
    return Model.find().sort({ nom: 1 }).exec();
  }

  async findActive(): Promise<TypeActiviteDocument[]> {
    const Model = await this.getModel();
    return Model.find({ life_cycle: 0 }).sort({ nom: 1 }).exec();
  }

  async findById(id: string): Promise<TypeActiviteDocument | null> {
    const Model = await this.getModel();
    return Model.findById(id).exec();
  }

  async create(data: Partial<TypeActiviteDocument>): Promise<TypeActiviteDocument> {
    const Model = await this.getModel();
    const typeActivite = new Model(data);
    return typeActivite.save();
  }

  async update(id: string, data: Partial<TypeActiviteDocument>): Promise<TypeActiviteDocument | null> {
    const Model = await this.getModel();
    return Model.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}
