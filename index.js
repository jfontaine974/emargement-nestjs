/**
 * Wrapper de compatibilite pour les tests Express/chai-http
 *
 * Ce fichier exporte l'Express app sous-jacente de NestJS,
 * compatible avec chai-http pour les tests.
 *
 * Usage dans les tests:
 *   const server = require('../index');
 *   chai.request(server).post('/test/users/list')...
 */

// IMPORTANT: Charger les variables d'environnement AVANT tout autre import
const path = require('path');
const fs = require('fs');

function loadEnvFile() {
  const nodeEnv = process.env.NODE_ENV;
  const isLocal = process.env.IS_LOCAL;

  let envPath;
  if (nodeEnv === 'test' && isLocal !== '1') {
    envPath = path.join(process.cwd(), 'test.env');
  } else if (nodeEnv === 'test' && isLocal === '1') {
    envPath = path.join(process.cwd(), 'test.local.env');
  } else {
    envPath = path.join(process.cwd(), '.env');
  }

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        if (key && value !== undefined) {
          // En mode test, toujours ecraser les variables d'environnement
          // pour s'assurer que les valeurs du fichier test.env sont utilisees
          process.env[key] = value;
        }
      }
    });
  }
}

// Charger les env AVANT d'importer NestJS
loadEnvFile();

const { NestFactory, HttpAdapterHost } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const cookieParser = require('cookie-parser');
const express = require('express');

let nestApp = null;
let expressApp = null;
let bootstrapPromise = null;

async function bootstrap() {
  // Eviter les initialisations multiples
  if (nestApp && expressApp) {
    return expressApp;
  }

  // Attendre si une initialisation est deja en cours
  if (bootstrapPromise) {
    return bootstrapPromise;
  }

  bootstrapPromise = (async () => {
    // Charger le module compile
    const { AppModule } = require('./dist/app.module');

    nestApp = await NestFactory.create(AppModule, {
      logger: process.env.DEBUG === '1' ? ['error', 'warn', 'log'] : false
    });

    // Configuration identique a main.ts
    const apiRoute = process.env.API_ROUTE || 'test';
    nestApp.setGlobalPrefix(apiRoute.replace('/', ''));

    nestApp.use(cookieParser());

    nestApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await nestApp.init();

    // Obtenir l'app Express sous-jacente
    expressApp = nestApp.getHttpAdapter().getInstance();

    return expressApp;
  })();

  return bootstrapPromise;
}

// Demarrer le bootstrap immediatement
const serverPromise = bootstrap();

// Creer un wrapper Express pour chai-http
// chai-http attend une fonction (middleware) ou un serveur HTTP
const wrapperApp = express();

// Middleware qui attend que NestJS soit pret et forward les requetes
wrapperApp.use((req, res, next) => {
  serverPromise.then(app => {
    // Forward la requete a l'app NestJS
    app(req, res, next);
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });
});

// Export du wrapper pour chai.request()
module.exports = wrapperApp;

// Methode pour fermer proprement le serveur
module.exports.close = async () => {
  if (nestApp) {
    await nestApp.close();
    nestApp = null;
    expressApp = null;
    bootstrapPromise = null;
  }
};

// Getter pour l'app NestJS (utile pour les tests)
module.exports.getApp = async () => {
  await bootstrap();
  return nestApp;
};

// Getter pour attendre que le serveur soit pret
module.exports.ready = () => serverPromise;
