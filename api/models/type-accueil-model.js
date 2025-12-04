const mongoose = require('mongoose');

const TypeAccueilSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  code: { type: String, required: true },
  hasTrancheAge: { type: Boolean, default: false },
  __user: { type: String },
  life_cycle: { type: Number, default: 0 },
}, {
  timestamps: true,
  collection: 'typeaccueils',
});

module.exports = mongoose.models.TypeAccueil || mongoose.model('TypeAccueil', TypeAccueilSchema);
