const mongoose = require('mongoose');

const EnfantCategorieSchema = mongoose.Schema({
  id_enfant: { type: String, required: true },
  id_categorie: { type: String, required: true },
  __user: { type: String },
  life_cycle: { type: Number, default: 0 },
}, { timestamps: true, collection: 'enfant-categories' });

EnfantCategorieSchema.methods = {
  view() {
    const enfantCategorie = this.toObject();
    delete enfantCategorie.__v;
    delete enfantCategorie.__user;
    return enfantCategorie;
  },
};

module.exports = mongoose.models['enfant-categorie'] || mongoose.model('enfant-categorie', EnfantCategorieSchema);
