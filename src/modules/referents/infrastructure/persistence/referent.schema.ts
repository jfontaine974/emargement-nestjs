import { Schema, Document } from 'mongoose';

export interface ReferentDocument extends Document {
  nom: string;
  prenom: string;
  phone?: string;
  phones?: Record<string, string>;
  email?: string;
  remarque?: string;
  profession?: string;
  adresse?: string[];
  __user?: string;
  life_cycle: number;
  createdAt: Date;
  updatedAt: Date;
  view(): Record<string, unknown>;
}

export const ReferentSchema = new Schema<ReferentDocument>(
  {
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    phone: { type: String },
    phones: { type: Object },
    email: { type: String },
    remarque: { type: String },
    profession: { type: String },
    adresse: [String],
    __user: { type: String },
    life_cycle: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'referents' },
);

ReferentSchema.methods.view = function () {
  const referent = this.toObject();

  // Synchroniser phone avec phones.principal
  if (referent.phone) {
    if (!referent.phones) {
      referent.phones = {};
    }
    // Si phones.principal n'existe pas, mettre phone comme principal
    if (!referent.phones.principal) {
      referent.phones['principal'] = referent.phone;
    }
  }

  delete referent.phone;
  delete referent.__v;
  delete referent.__user;
  return referent;
};
