// Couche de compatibilite pour les tests - Categorie Model
const mongoose = require('mongoose');

const CategorieSchema = mongoose.Schema({
    nom: { type: String, required: true },
    nom_interne: { type: String },
    parent_id: { type: String, default: '0' },
    implantation_id: { type: String },
    debutArrivee: { type: String },
    debutDepart: { type: String },
    debutJournee: { type: String },
    finArrivee: { type: String },
    finDepart: { type: String },
    finJournee: { type: String },
    isArrivee: { type: Boolean, default: false },
    isDepart: { type: Boolean, default: false },
    isJournee: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isTaux: { type: Boolean, default: false },
    taux: { type: Number, default: 0 },
    tranche: { type: Number, default: 60 },
    __user: { type: String },
    life_cycle: { type: Number, default: 0 },
}, { strict: "throw", timestamps: true });

CategorieSchema.methods.view = function() {
    var cat = this.toObject();
    delete cat.__v;
    delete cat.__user;
    delete cat.createdAt;
    return cat;
};

module.exports = mongoose.model('Categorie', CategorieSchema);
