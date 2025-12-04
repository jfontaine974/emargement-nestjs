// Couche de compatibilite pour les tests - User Model
const mongoose = require('mongoose');

const roles = ['DEV', 'OPER', 'ADMIN'];

const UserSchema = mongoose.Schema({
    identifiant: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nom: { type: String },
    prenom: { type: String },
    email: { type: String },
    phone: { type: String },
    role: {
        type: String,
        enum: roles,
        default: 'OPER',
    },
    __user: { type: String },
    life_cycle: { type: Number, default: 0 },
}, { strict: "throw", timestamps: true });

UserSchema.methods.view = function() {
    var user = this.toObject();
    delete user.password;
    delete user.__v;
    delete user.__user;
    return user;
};

module.exports = mongoose.model('User', UserSchema);
