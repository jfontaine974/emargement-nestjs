import { Schema, Document, Types } from 'mongoose';

export interface CategorieDocument extends Document {
  nom: string;
  isJournee?: boolean;
  debutJournee?: string;
  finJournee?: string;
  isArrivee?: boolean;
  debutArrivee?: string;
  finArrivee?: string;
  isDepart?: boolean;
  debutDepart?: string;
  finDepart?: string;
  parent_id: string;
  isTaux?: boolean;
  taux?: number;
  tranche?: number;
  archivedBatchId?: string;
  type_activite_id?: Types.ObjectId;
  type_accueil_id?: Types.ObjectId;
  periode_id?: Types.ObjectId;
  tranche_age_id?: Types.ObjectId;
  implantation_id?: Types.ObjectId;
  __user?: string;
  life_cycle: number;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
  view(): Record<string, unknown>;
}

export const CategorieSchema = new Schema<CategorieDocument>(
  {
    nom: { type: String, required: true },
    isJournee: { type: Boolean, default: null },
    debutJournee: { type: String, default: null },
    finJournee: { type: String, default: null },
    isArrivee: { type: Boolean, default: null },
    debutArrivee: { type: String, default: null },
    finArrivee: { type: String, default: null },
    isDepart: { type: Boolean, default: null },
    debutDepart: { type: String, default: null },
    finDepart: { type: String, default: null },
    parent_id: { type: String, default: '0' },
    isTaux: { type: Boolean, default: false },
    taux: { type: Number, default: 0 },
    tranche: { type: Number, default: 60 },
    archivedBatchId: { type: String, default: null },
    type_activite_id: {
      type: Schema.Types.ObjectId,
      ref: 'TypeActivite',
      required: false,
    },
    type_accueil_id: {
      type: Schema.Types.ObjectId,
      ref: 'TypeAccueil',
      required: false,
    },
    periode_id: {
      type: Schema.Types.ObjectId,
      ref: 'Periode',
      required: false,
    },
    tranche_age_id: {
      type: Schema.Types.ObjectId,
      ref: 'TrancheAge',
      required: false,
    },
    implantation_id: {
      type: Schema.Types.ObjectId,
      ref: 'Implantation',
      required: false,
    },
    __user: { type: String },
    life_cycle: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'categories' },
);

CategorieSchema.methods.view = function () {
  const categorie = this.toObject();
  delete categorie.__v;
  delete categorie.__user;
  delete categorie.createdAt;
  delete categorie.archivedBatchId;
  return categorie;
};
