import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PeriodeRepository } from '../../domain/periode.repository';
import { PeriodeDocument, PeriodeSchema } from './periode.schema';
import { TenantConnectionService } from '../../../../shared/database/tenant-connection.service';

@Injectable()
export class PeriodeRepositoryImpl implements PeriodeRepository {
  constructor(private readonly tenantConnection: TenantConnectionService) {}

  private async getModel(): Promise<Model<PeriodeDocument>> {
    return this.tenantConnection.getModel<PeriodeDocument>('Periode', PeriodeSchema);
  }

  async findAll(): Promise<PeriodeDocument[]> {
    const Model = await this.getModel();
    return Model.find().sort({ ordre: 1, nom: 1 }).exec();
  }

  async findActive(): Promise<PeriodeDocument[]> {
    const Model = await this.getModel();
    return Model.find({ life_cycle: 0 }).sort({ ordre: 1, nom: 1 }).exec();
  }

  async findById(id: string): Promise<PeriodeDocument | null> {
    const Model = await this.getModel();
    return Model.findById(id).exec();
  }

  async create(data: Partial<PeriodeDocument>): Promise<PeriodeDocument> {
    const Model = await this.getModel();
    const periode = new Model(data);
    return periode.save();
  }

  async update(id: string, data: Partial<PeriodeDocument>): Promise<PeriodeDocument | null> {
    const Model = await this.getModel();
    return Model.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}
