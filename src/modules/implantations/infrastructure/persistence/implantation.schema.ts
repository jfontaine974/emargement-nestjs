import { Schema, Document } from 'mongoose';

export interface EcoleInfo {
  nom_etablissement: string;
  adresse_1?: string;
  adresse_2?: string;
  adresse_3?: string;
  code_postal: string;
  nom_commune: string;
  identifiant_de_l_etablissement: string;
}

export interface ImplantationDocument extends Document {
  nom: string;
  alias?: string;
  adresse?: string;
  remarque?: string;
  ecole: EcoleInfo;
  __user?: string;
  life_cycle: number;
  createdAt: Date;
  updatedAt: Date;
  view(): Omit<ImplantationDocument, '__v' | '__user' | 'createdAt'>;
}

const EcoleSchema = new Schema(
  {
    nom_etablissement: { type: String, required: true },
    adresse_1: { type: String, default: null },
    adresse_2: { type: String, default: null },
    adresse_3: { type: String, default: null },
    code_postal: { type: String, required: true },
    nom_commune: { type: String, required: true },
    identifiant_de_l_etablissement: { type: String, required: true },
  },
  { _id: false },
);

export const ImplantationSchema = new Schema<ImplantationDocument>(
  {
    nom: { type: String, required: true },
    alias: { type: String, default: null },
    adresse: { type: String, default: null },
    remarque: { type: String, default: null },
    ecole: { type: EcoleSchema, required: true },
    __user: { type: String },
    life_cycle: { type: Number, default: 0 },
  },
  {
    strict: 'throw',
    timestamps: true,
    collection: 'implantations',
  },
);

// Methode view() comme dans l'original
ImplantationSchema.methods.view = function () {
  const implantation = this.toObject();
  delete implantation.__v;
  delete implantation.__user;
  // Garder createdAt dans la response (contrairement a users)
  return implantation;
};
