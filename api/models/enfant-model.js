const mongoose = require('mongoose');

const EnfantSchema = mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  date_naissance: { type: Date },
  genre: { type: String },
  __user: { type: String },
  life_cycle: { type: Number, default: 0 },
}, { timestamps: true, collection: 'enfants' });

EnfantSchema.methods = {
  view() {
    const enfant = this.toObject();
    delete enfant.__v;
    delete enfant.__user;
    return enfant;
  },
};

module.exports = mongoose.models.Enfant || mongoose.model('Enfant', EnfantSchema);
