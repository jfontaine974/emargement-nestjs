// Couche de compatibilite pour les tests - Categorie Model
const mongoose = require('mongoose');

const CategorieSchema = mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TypeActivite',
    required: false,
  },
  type_accueil_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TypeAccueil',
    required: false,
  },
  periode_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Periode',
    required: false,
  },
  tranche_age_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrancheAge',
    required: false,
  },
  implantation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Implantation',
    required: false,
  },
  __user: { type: String },
  life_cycle: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true, collection: 'categories' });

CategorieSchema.query.notDeleted = function() {
  return this.where({ $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] });
};

CategorieSchema.methods.view = function() {
  const categorie = this.toObject();
  delete categorie.__v;
  delete categorie.__user;
  delete categorie.createdAt;
  delete categorie.archivedBatchId;
  return categorie;
};

module.exports = mongoose.models.Categorie || mongoose.model('Categorie', CategorieSchema);
