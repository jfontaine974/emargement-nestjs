import { Schema, Document } from 'mongoose';

export interface EnfantCategorieDocument extends Document {
  id_enfant: string;
  id_categorie: string;
  __user?: string;
  life_cycle: number;
  createdAt: Date;
  updatedAt: Date;
  view(): Record<string, unknown>;
}

export const EnfantCategorieSchema = new Schema<EnfantCategorieDocument>(
  {
    id_enfant: { type: String, required: true },
    id_categorie: { type: String, required: true },
    __user: { type: String },
    life_cycle: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'enfant-categories' },
);

EnfantCategorieSchema.methods.view = function () {
  const enfantCategorie = this.toObject();
  delete enfantCategorie.__v;
  delete enfantCategorie.__user;
  return enfantCategorie;
};
