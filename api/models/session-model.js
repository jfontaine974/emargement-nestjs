// Couche de compatibilite pour les tests - Session Model
const mongoose = require('mongoose');

const SessionSchema = mongoose.Schema({
    id_user: { type: String },
    __user: { type: String },
    life_cycle: { type: Number, default: 0 },
}, { strict: "throw", timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
