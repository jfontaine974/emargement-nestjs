import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { TenantConnectionService } from '../../../../shared/database/tenant-connection.service';
import { TypeAccueilRepository } from '../../domain/type-accueil.repository';
import { TypeAccueilDocument, TypeAccueilSchema } from './type-accueil.schema';

@Injectable()
export class TypeAccueilRepositoryImpl implements TypeAccueilRepository {
  constructor(private readonly tenantConnection: TenantConnectionService) {}

  private async getModel(): Promise<Model<TypeAccueilDocument>> {
    return this.tenantConnection.getModel<TypeAccueilDocument>('TypeAccueil', TypeAccueilSchema);
  }

  async findAll(): Promise<TypeAccueilDocument[]> {
    const Model = await this.getModel();
    return Model.find().sort({ nom: 1 }).exec();
  }

  async findActive(): Promise<TypeAccueilDocument[]> {
    const Model = await this.getModel();
    return Model.find({ life_cycle: 0 }).sort({ nom: 1 }).exec();
  }

  async findById(id: string): Promise<TypeAccueilDocument | null> {
    const Model = await this.getModel();
    return Model.findById(id).exec();
  }

  async create(data: Partial<TypeAccueilDocument>): Promise<TypeAccueilDocument> {
    const Model = await this.getModel();
    const typeAccueil = new Model(data);
    return typeAccueil.save();
  }

  async update(id: string, data: Partial<TypeAccueilDocument>): Promise<TypeAccueilDocument | null> {
    const Model = await this.getModel();
    return Model.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}
