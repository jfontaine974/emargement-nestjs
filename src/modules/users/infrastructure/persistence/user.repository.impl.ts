import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserRepository } from '../../domain/user.repository';
import { UserDocument, UserSchema } from './user.schema';
import { TenantConnectionService } from '../../../../shared/database/tenant-connection.service';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    private readonly tenantConnection: TenantConnectionService,
  ) {}

  private async getModel(): Promise<Model<UserDocument>> {
    return this.tenantConnection.getModel<UserDocument>('User', UserSchema);
  }

  async findAll(): Promise<UserDocument[]> {
    const Model = await this.getModel();
    return Model.find().exec();
  }

  async findAllActive(): Promise<UserDocument[]> {
    const Model = await this.getModel();
    return Model.find({ life_cycle: { $lt: 9 } }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    const Model = await this.getModel();
    return Model.findById(id).exec();
  }

  async findByIdentifiant(identifiant: string): Promise<UserDocument | null> {
    const Model = await this.getModel();
    return Model.findOne({ identifiant }).exec();
  }

  async findFromDate(date: Date): Promise<UserDocument[]> {
    const Model = await this.getModel();
    return Model.find({ updatedAt: { $gt: date } }).exec();
  }

  async create(data: Partial<UserDocument>): Promise<UserDocument> {
    const Model = await this.getModel();
    const user = new Model(data);
    return user.save();
  }

  async update(
    id: string,
    data: Partial<UserDocument>,
  ): Promise<UserDocument | null> {
    const Model = await this.getModel();
    return Model.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async updatePassword(
    id: string,
    hashedPassword: string,
  ): Promise<UserDocument | null> {
    const Model = await this.getModel();
    return Model.findByIdAndUpdate(
      id,
      { $set: { password: hashedPassword } },
      { new: true },
    ).exec();
  }

  async disable(id: string): Promise<UserDocument | null> {
    const Model = await this.getModel();
    return Model.findByIdAndUpdate(
      id,
      { $set: { life_cycle: 9 } },
      { new: true },
    ).exec();
  }

  async enable(id: string): Promise<UserDocument | null> {
    const Model = await this.getModel();
    return Model.findByIdAndUpdate(
      id,
      { $set: { life_cycle: 0 } },
      { new: true },
    ).exec();
  }
}
