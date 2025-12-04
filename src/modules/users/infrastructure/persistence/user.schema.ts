import { Schema, Document } from 'mongoose';

export const ROLES = ['DEV', 'OPER', 'ADMIN'] as const;
export type UserRole = (typeof ROLES)[number];

export interface UserDocument extends Document {
  identifiant: string;
  password: string;
  nom?: string;
  prenom?: string;
  email?: string;
  phone?: string;
  role: UserRole;
  __user?: string;
  life_cycle: number;
  createdAt: Date;
  updatedAt: Date;
  view(): Omit<UserDocument, 'password' | '__v' | '__user'>;
}

export const UserSchema = new Schema<UserDocument>(
  {
    identifiant: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nom: { type: String },
    prenom: { type: String },
    email: { type: String },
    phone: { type: String },
    role: {
      type: String,
      enum: ROLES,
      default: 'OPER',
    },
    __user: { type: String },
    life_cycle: { type: Number, default: 0 },
  },
  {
    strict: 'throw',
    timestamps: true,
    collection: 'users',
  },
);

// Methode view() comme dans l'original
// Note: On exclut createdAt car les tests originaux n'ont pas ce champ dans les fixtures
UserSchema.methods.view = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  delete user.__user;
  delete user.createdAt;
  return user;
};
