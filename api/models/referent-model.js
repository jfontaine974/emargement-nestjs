// Couche de compatibilite pour les tests - Referent Model
const mongoose = require('mongoose');

const ReferentSchema = mongoose.Schema({
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
}, { timestamps: true, collection: 'referents' });

ReferentSchema.methods.view = function() {
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

module.exports = mongoose.models.Referent || mongoose.model('Referent', ReferentSchema);
