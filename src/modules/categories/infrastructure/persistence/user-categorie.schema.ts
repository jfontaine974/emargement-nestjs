import { Schema, Document } from 'mongoose';

export interface UserCategorieDocument extends Document {
  id_user: string;
  id_categorie: string;
  __user?: string;
  life_cycle: number;
  createdAt: Date;
  updatedAt: Date;
  view(): Record<string, unknown>;
}

export const UserCategorieSchema = new Schema<UserCategorieDocument>(
  {
    id_user: { type: String, required: true },
    id_categorie: { type: String, required: true },
    __user: { type: String },
    life_cycle: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'user-categories' },
);

UserCategorieSchema.methods.view = function () {
  const userCategorie = this.toObject();
  delete userCategorie.__v;
  delete userCategorie.__user;
  return userCategorie;
};
