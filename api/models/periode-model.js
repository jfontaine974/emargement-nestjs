const mongoose = require('mongoose');

const PeriodeSchema = new mongoose.Schema({
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
}, {
  timestamps: true,
  collection: 'periodes',
});

module.exports = mongoose.models.Periode || mongoose.model('Periode', PeriodeSchema);
