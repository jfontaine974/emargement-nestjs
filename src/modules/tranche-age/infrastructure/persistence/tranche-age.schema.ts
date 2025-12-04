import { Schema, Document } from 'mongoose';

export interface TrancheAgeDocument extends Document {
  nom: string;
  code: string;
  __user?: string;
  life_cycle: number;
  createdAt: Date;
  updatedAt: Date;
  view(): Record<string, unknown>;
}

export const TrancheAgeSchema = new Schema<TrancheAgeDocument>(
  {
    nom: { type: String, required: true },
    code: { type: String, required: true },
    __user: { type: String },
    life_cycle: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'trancheages',
  },
);

TrancheAgeSchema.methods.view = function () {
  const trancheAge = this.toObject();
  delete trancheAge.__v;
  delete trancheAge.__user;
  return trancheAge;
};
