import { UserDocument } from '../infrastructure/persistence/user.schema';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface UserRepository {
  findAll(): Promise<UserDocument[]>;
  findAllActive(): Promise<UserDocument[]>;
  findById(id: string): Promise<UserDocument | null>;
  findByIdentifiant(identifiant: string): Promise<UserDocument | null>;
  findFromDate(date: Date): Promise<UserDocument[]>;
  create(data: Partial<UserDocument>): Promise<UserDocument>;
  update(id: string, data: Partial<UserDocument>): Promise<UserDocument | null>;
  updatePassword(id: string, hashedPassword: string): Promise<UserDocument | null>;
  disable(id: string): Promise<UserDocument | null>;
  enable(id: string): Promise<UserDocument | null>;
}
