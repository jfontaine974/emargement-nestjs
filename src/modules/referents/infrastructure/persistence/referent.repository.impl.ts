import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { TenantConnectionService } from '../../../../shared/database/tenant-connection.service';
import { ReferentRepository } from '../../domain/referent.repository';
import { ReferentDocument, ReferentSchema } from './referent.schema';

@Injectable()
export class ReferentRepositoryImpl implements ReferentRepository {
  constructor(private readonly tenantConnection: TenantConnectionService) {}

  private async getModel(): Promise<Model<ReferentDocument>> {
    return this.tenantConnection.getModel<ReferentDocument>('Referent', ReferentSchema);
  }

  async findAll(): Promise<ReferentDocument[]> {
    const Model = await this.getModel();
    // Ne pas filtrer par life_cycle ici - la méthode originale fait .where("life_cycle") sans condition
    return Model.find().exec();
  }

  async findAllFromDate(date: string): Promise<ReferentDocument[]> {
    const Model = await this.getModel();
    return Model.find({ updatedAt: { $gt: new Date(date) } }).exec();
  }

  async findById(id: string): Promise<ReferentDocument | null> {
    const Model = await this.getModel();
    return Model.findById(id).exec();
  }

  async create(data: Partial<ReferentDocument>): Promise<ReferentDocument> {
    const Model = await this.getModel();
    const referent = new Model(data);
    return referent.save();
  }

  async update(id: string, data: Partial<ReferentDocument>): Promise<ReferentDocument | null> {
    const Model = await this.getModel();
    return Model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async disable(id: string): Promise<ReferentDocument | null> {
    const Model = await this.getModel();
    return Model.findByIdAndUpdate(id, { life_cycle: 9 }, { new: true }).exec();
  }

  async delete(id: string): Promise<ReferentDocument | null> {
    const Model = await this.getModel();
    return Model.findByIdAndDelete(id).exec();
  }
}
