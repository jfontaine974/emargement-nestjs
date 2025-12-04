// Couche de compatibilite pour les tests - UserCategorie Model
const mongoose = require('mongoose');

const UserCategorieSchema = mongoose.Schema({
  id_user: { type: String, required: true },
  id_categorie: { type: String, required: true },
  __user: { type: String },
  life_cycle: { type: Number, default: 0 },
}, { timestamps: true, collection: 'user-categories' });

UserCategorieSchema.methods.view = function() {
  const userCategorie = this.toObject();
  delete userCategorie.__v;
  delete userCategorie.__user;
  return userCategorie;
};

module.exports = mongoose.models['user-categorie'] || mongoose.model('user-categorie', UserCategorieSchema);
