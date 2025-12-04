const mongoose = require('mongoose');

const TypeActiviteSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  __user: { type: String },
  life_cycle: { type: Number, default: 0 },
}, {
  timestamps: true,
  collection: 'typeactivites',
});

module.exports = mongoose.models.TypeActivite || mongoose.model('TypeActivite', TypeActiviteSchema);
