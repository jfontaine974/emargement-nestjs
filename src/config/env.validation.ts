import * as Joi from 'joi';
import { EnvironmentVariables } from './environment.interface';

export const envValidationSchema = Joi.object<EnvironmentVariables>({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  APP_PORT: Joi.number().default(3000),
  API_ROUTE: Joi.string().default('api'),
  DEBUG: Joi.alternatives()
    .try(Joi.boolean(), Joi.string().valid('0', '1'))
    .default(false),
  DEBUG_RESPONSE: Joi.alternatives()
    .try(Joi.boolean(), Joi.string().valid('0', '1'))
    .default(false),

  // MongoDB Admin (multi-tenant)
  ADMIN_MONGO_URI: Joi.string().when('USE_MEMORY_DB', {
    is: true,
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),

  // MongoDB (mode test)
  USE_MEMORY_DB: Joi.boolean().default(false),
  MONGO_URI: Joi.string().optional(),
  MONGO_DB: Joi.string().optional(),
  MONGO_USERNAME: Joi.string().optional().allow(''),
  MONGO_PASS: Joi.string().optional().allow(''),
  MONGO_SERVER: Joi.string().optional(),
  MONGO_PORT: Joi.number().optional(),
  MONGO_USE_SSL: Joi.boolean().default(false),
  MONGO_SSLKEY: Joi.string().optional().allow(''),
  MONGO_SSLCERT: Joi.string().optional().allow(''),
  MONGO_SSLCA: Joi.string().optional().allow(''),

  // Encryption
  ENCKEY: Joi.string().required(),
  SIGKEY: Joi.string().required(),

  // Token (valeurs par defaut)
  SECRET_TOKEN: Joi.string().required(),
  SECRET_REFRESH_TOKEN: Joi.string().required(),
  ACCESS_TOKEN_EXPIRE_SECOND: Joi.number().default(3600),
  REFRESH_TOKEN_EXPIRE_DAY: Joi.number().default(7),
  JWT_EXPIRE_HOUR: Joi.number().default(1),
  ALGORITHM: Joi.string().default('HS256'),

  // Password
  SALT_ROUND: Joi.number().default(10),

  // Folders
  EMARGEMENTS_FOLDER: Joi.string().default('./uploads/emargements'),
  EMARGEMENTSANIM_FOLDER: Joi.string().default('./uploads/emargements_anim'),
  EMARGEMENTS_UNZIP_FOLDER: Joi.string().default('./uploads/emargements_unzip'),
  EMARGEMENTSANIM_UNZIP_FOLDER: Joi.string().default(
    './uploads/emargements_anim_unzip',
  ),
  EMARGEMENTS_EXPORT_PDF: Joi.string().default('./uploads/pdf'),
  APK_FOLDER: Joi.string().default('./uploads/apk'),
  APK_NAME: Joi.string().default('emargement.apk'),
  CLIENT_FOLDER: Joi.string().default('./client'),
  FOLDER_ASSETS: Joi.string().default('./assets'),

  // Data files
  ECOLES_DATA_PATH: Joi.string().optional(),

  // Application params
  MAX_FILE_SIZE_MO: Joi.number().default(5),
  NOM_ASSO: Joi.string().default('Association'),
  SIGNATURE_GENERIQUE: Joi.string().optional().allow(''),

  // URLs
  API_URL: Joi.string().optional(),
  CLIENT_URL: Joi.string().optional(),
});

export function validateEnvironment(config: Record<string, unknown>) {
  const { error, value } = envValidationSchema.validate(config, {
    allowUnknown: true,
    abortEarly: false,
  });

  if (error) {
    throw new Error(`Configuration validation error: ${error.message}`);
  }

  return value;
}
