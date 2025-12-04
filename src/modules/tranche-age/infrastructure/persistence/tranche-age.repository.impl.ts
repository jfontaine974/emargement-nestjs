import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { TrancheAgeRepository } from '../../domain/tranche-age.repository';
import { TrancheAgeDocument, TrancheAgeSchema } from './tranche-age.schema';
import { TenantConnectionService } from '../../../../shared/database/tenant-connection.service';

@Injectable()
export class TrancheAgeRepositoryImpl implements TrancheAgeRepository {
  constructor(private readonly tenantConnection: TenantConnectionService) {}

  private async getModel(): Promise<Model<TrancheAgeDocument>> {
    return this.tenantConnection.getModel<TrancheAgeDocument>('TrancheAge', TrancheAgeSchema);
  }

  async findAll(): Promise<TrancheAgeDocument[]> {
    const Model = await this.getModel();
    return Model.find().sort({ nom: 1 }).exec();
  }

  async findActive(): Promise<TrancheAgeDocument[]> {
    const Model = await this.getModel();
    return Model.find({ life_cycle: { $ne: 9 } }).sort({ nom: 1 }).exec();
  }

  async findById(id: string): Promise<TrancheAgeDocument | null> {
    const Model = await this.getModel();
    return Model.findById(id).exec();
  }

  async create(data: Partial<TrancheAgeDocument>): Promise<TrancheAgeDocument> {
    const Model = await this.getModel();
    const trancheAge = new Model(data);
    return trancheAge.save();
  }

  async update(id: string, data: Partial<TrancheAgeDocument>): Promise<TrancheAgeDocument | null> {
    const Model = await this.getModel();
    return Model.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}
