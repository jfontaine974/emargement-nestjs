/**
 * Utilitaire de connexion à la base de données pour les tests
 */
const { initializeDatabase } = require('../../services/database-service');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoMemoryServer;
let mongoUri;

/**
 * Se connecte à la base de données pour les tests
 * - Utilise le service database-service pour gérer une connexion unique
 * @param {Function} callback - Fonction à exécuter après la connexion réussie
 */
exports.connectToDatabase = async function(callback) {
  try {
    const uri = await initializeDatabase();
    console.log('Test connecté à la base de données via le service centralisé');
    
    // Stocker l'URI de connexion pour les tests qui utilisent directement MongoClient
    mongoUri = uri;
    
    if (callback) {
      return callback();
    }
    return Promise.resolve();
  } catch (error) {
    console.error('Erreur de connexion pour les tests:', error);
    return Promise.reject(error);
  }
};

/**
 * Obtenir l'URI de connexion à MongoDB (utilisé par les tests qui utilisent directement MongoClient)
 */
exports.getMongoUri = () => {
  return mongoUri;
};
