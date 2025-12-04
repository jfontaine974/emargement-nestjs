const mongoose = require('mongoose');

const TrancheAgeSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  code: { type: String, required: true },
  __user: { type: String },
  life_cycle: { type: Number, default: 0 },
}, {
  timestamps: true,
  collection: 'trancheages',
});

module.exports = mongoose.models.TrancheAge || mongoose.model('TrancheAge', TrancheAgeSchema);
