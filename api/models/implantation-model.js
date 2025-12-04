// Couche de compatibilite pour les tests - Implantation Model
const mongoose = require('mongoose');

const EcoleSchema = mongoose.Schema({
    nom_etablissement: { type: String, required: true },
    adresse_1: { type: String, default: null },
    adresse_2: { type: String, default: null },
    adresse_3: { type: String, default: null },
    code_postal: { type: String, required: true },
    nom_commune: { type: String, required: true },
    identifiant_de_l_etablissement: { type: String, required: true },
}, { _id: false });

const ImplantationSchema = mongoose.Schema({
    nom: { type: String, required: true },
    alias: { type: String, default: null },
    adresse: { type: String, default: null },
    remarque: { type: String, default: null },
    ecole: { type: EcoleSchema, required: true },
    __user: { type: String },
    life_cycle: { type: Number, default: 0 },
}, { strict: "throw", timestamps: true });

ImplantationSchema.methods.view = function() {
    var implantation = this.toObject();
    delete implantation.__v;
    delete implantation.__user;
    delete implantation.createdAt;
    return implantation;
};

module.exports = mongoose.model('Implantation', ImplantationSchema);
