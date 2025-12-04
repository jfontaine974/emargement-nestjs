import { Schema, Document } from 'mongoose';

export interface TypeAccueilDocument extends Document {
  nom: string;
  code: string;
  hasTrancheAge: boolean;
  __user?: string;
  life_cycle: number;
  createdAt: Date;
  updatedAt: Date;
  view(): Record<string, unknown>;
}

export const TypeAccueilSchema = new Schema<TypeAccueilDocument>(
  {
    nom: { type: String, required: true },
    code: { type: String, required: true },
    hasTrancheAge: { type: Boolean, default: false },
    __user: { type: String },
    life_cycle: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'typeaccueils',
  },
);

TypeAccueilSchema.methods.view = function () {
  const typeAccueil = this.toObject();
  delete typeAccueil.__v;
  delete typeAccueil.__user;
  return typeAccueil;
};
