import { Schema, Document } from 'mongoose';

export interface TypeActiviteDocument extends Document {
  nom: string;
  code: string;
  __user?: string;
  life_cycle: number;
  createdAt: Date;
  updatedAt: Date;
  view(): Record<string, unknown>;
}

export const TypeActiviteSchema = new Schema<TypeActiviteDocument>(
  {
    nom: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    __user: { type: String },
    life_cycle: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'typeactivites',
  },
);

TypeActiviteSchema.methods.view = function () {
  const typeActivite = this.toObject();
  delete typeActivite.__v;
  delete typeActivite.__user;
  return typeActivite;
};
