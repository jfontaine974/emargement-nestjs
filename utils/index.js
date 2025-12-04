// Couche de compatibilite pour les tests
exports.getCopy = function(obj) {
    return JSON.parse(JSON.stringify(obj));
};
