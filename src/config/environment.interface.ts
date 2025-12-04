export interface EnvironmentVariables {
  // Application
  NODE_ENV: 'development' | 'production' | 'test';
  APP_PORT: number;
  API_ROUTE: string;
  DEBUG: boolean | string;
  DEBUG_RESPONSE: boolean | string;

  // MongoDB Admin (multi-tenant config)
  ADMIN_MONGO_URI: string;

  // MongoDB (pour mode test single-tenant)
  USE_MEMORY_DB: boolean;
  MONGO_URI?: string;
  MONGO_DB?: string;
  MONGO_USERNAME?: string;
  MONGO_PASS?: string;
  MONGO_SERVER?: string;
  MONGO_PORT?: number;
  MONGO_USE_SSL?: boolean;
  MONGO_SSLKEY?: string;
  MONGO_SSLCERT?: string;
  MONGO_SSLCA?: string;

  // Encryption
  ENCKEY: string;
  SIGKEY: string;

  // Token (valeurs par defaut, surchargees par config tenant)
  SECRET_TOKEN: string;
  SECRET_REFRESH_TOKEN: string;
  ACCESS_TOKEN_EXPIRE_SECOND: number;
  REFRESH_TOKEN_EXPIRE_DAY: number;
  JWT_EXPIRE_HOUR: number;
  ALGORITHM: string;

  // Password
  SALT_ROUND: number;

  // Folders
  EMARGEMENTS_FOLDER: string;
  EMARGEMENTSANIM_FOLDER: string;
  EMARGEMENTS_UNZIP_FOLDER: string;
  EMARGEMENTSANIM_UNZIP_FOLDER: string;
  EMARGEMENTS_EXPORT_PDF: string;
  APK_FOLDER: string;
  APK_NAME: string;
  CLIENT_FOLDER: string;
  FOLDER_ASSETS: string;

  // Data files
  ECOLES_DATA_PATH?: string;

  // Application params
  MAX_FILE_SIZE_MO: number;
  NOM_ASSO: string;
  SIGNATURE_GENERIQUE: string;

  // URLs
  API_URL: string;
  CLIENT_URL: string;
}
