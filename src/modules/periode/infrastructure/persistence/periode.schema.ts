import { Schema, Document } from 'mongoose';

export interface PeriodeDocument extends Document {
  nom: string;
  code: string;
  type: 'HEBDOMADAIRE' | 'VACANCES' | 'AUTRE';
  ordre?: number;
  type_accueil_id: string;
  __user?: string;
  life_cycle: number;
  createdAt: Date;
  updatedAt: Date;
  view(): Record<string, unknown>;
}

export const PeriodeSchema = new Schema<PeriodeDocument>(
  {
    nom: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    type: {
      type: String,
      required: true,
      enum: ['HEBDOMADAIRE', 'VACANCES', 'AUTRE'],
    },
    ordre: { type: Number },
    type_accueil_id: { type: String, required: true },
    __user: { type: String },
    life_cycle: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'periodes',
  },
);

PeriodeSchema.methods.view = function () {
  const periode = this.toObject();
  delete periode.__v;
  delete periode.__user;
  return periode;
};
