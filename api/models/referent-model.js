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

ReferentSchema.methods.view = function () {
  var referent = this.toObject()
  if (referent.phone) {
    if (!referent.phones)
      referent.phones = {}
    if (Object.values(referent.phones).filter(e => e == referent.phone) == 0)
      referent.phones['principal'] = referent.phone
  }
  delete referent.phone
  delete referent.__v
  delete referent.__user
  return referent
}

module.exports = mongoose.models.Referent || mongoose.model('Referent', ReferentSchema);
