// Couche de compatibilite pour les tests - Database Service
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;
let isConnected = false;
let memoryUri = null;

async function initializeDatabase() {
    if (isConnected && mongoose.connection.readyState === 1) {
        return memoryUri;
    }

    // Creer le serveur MongoDB en memoire
    if (!mongod) {
        mongod = await MongoMemoryServer.create();
    }

    memoryUri = mongod.getUri();

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(memoryUri);
        console.log('Connecte a MongoDB Memory Server:', memoryUri);
    }

    isConnected = true;
    return memoryUri;
}

// Expose le serveur MongoDB en memoire pour le reutiliser dans NestJS
function getMemoryServer() {
    return mongod;
}

function getMemoryUri() {
    return memoryUri;
}

async function closeDatabase() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    }
    if (mongod) {
        await mongod.stop();
        mongod = null;
    }
    isConnected = false;
    memoryUri = null;
}

async function clearDatabase() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
}

module.exports = {
    initializeDatabase,
    closeDatabase,
    clearDatabase,
    getMemoryServer,
    getMemoryUri,
    mongoose
};
