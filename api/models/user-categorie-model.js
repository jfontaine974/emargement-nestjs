// Couche de compatibilite pour les tests - UserCategorie Model
const mongoose = require('mongoose');

const UserCategorieSchema = mongoose.Schema({
    id_user: { type: String, required: true },
    id_categorie: { type: String, required: true },
    __user: { type: String },
    life_cycle: { type: Number, default: 0 },
}, { strict: "throw", timestamps: true });

module.exports = mongoose.model('UserCategorie', UserCategorieSchema);
