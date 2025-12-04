import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ImplantationRepository } from '../../domain/implantation.repository';
import { ImplantationDocument, ImplantationSchema } from './implantation.schema';
import { TenantConnectionService } from '../../../../shared/database/tenant-connection.service';

@Injectable()
export class ImplantationRepositoryImpl implements ImplantationRepository {
  constructor(
    private readonly tenantConnection: TenantConnectionService,
  ) {}

  private async getModel(): Promise<Model<ImplantationDocument>> {
    return this.tenantConnection.getModel<ImplantationDocument>('Implantation', ImplantationSchema);
  }

  async findAll(): Promise<ImplantationDocument[]> {
    const Model = await this.getModel();
    return Model.find().sort({ nom: 1 }).exec();
  }

  async findById(id: string): Promise<ImplantationDocument | null> {
    const Model = await this.getModel();
    return Model.findById(id).exec();
  }

  async create(data: Partial<ImplantationDocument>): Promise<ImplantationDocument> {
    const Model = await this.getModel();
    const implantation = new Model(data);
    return implantation.save();
  }

  async update(
    id: string,
    data: Partial<ImplantationDocument>,
  ): Promise<ImplantationDocument | null> {
    const Model = await this.getModel();
    return Model.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }
}
