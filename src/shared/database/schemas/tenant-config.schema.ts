import { Schema, Document } from 'mongoose';

export interface TenantConfig {
  tenantId: string;
  nom: string;
  mongoUri: string;
  appConfig: {
    API_ROUTE?: string;
    EMARGEMENTS_FOLDER?: string;
    EMARGEMENTSANIM_FOLDER?: string;
    EMARGEMENTS_UNZIP_FOLDER?: string;
    EMARGEMENTSANIM_UNZIP_FOLDER?: string;
    EMARGEMENTS_EXPORT_PDF?: string;
    APK_FOLDER?: string;
    APK_NAME?: string;
    CLIENT_FOLDER?: string;
    FOLDER_ASSETS?: string;
    MAX_FILE_SIZE_MO?: number;
    NOM_ASSO?: string;
    SIGNATURE_GENERIQUE?: string;
  };
  tokenConfig: {
    SECRET_TOKEN: string;
    SECRET_REFRESH_TOKEN: string;
    ACCESS_TOKEN_EXPIRE_SECOND?: number;
    REFRESH_TOKEN_EXPIRE_DAY?: number;
    JWT_EXPIRE_HOUR?: number;
    ALGORITHM?: string;
  };
  passwordConfig: {
    SALT_ROUND?: number;
  };
  encryptionConfig: {
    ENCKEY: string;
    SIGKEY: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantConfigDocument extends TenantConfig, Document {}

export const TenantConfigSchema = new Schema<TenantConfigDocument>(
  {
    tenantId: { type: String, required: true, unique: true, index: true },
    nom: { type: String, required: true },
    mongoUri: { type: String, required: true },
    appConfig: {
      API_ROUTE: { type: String },
      EMARGEMENTS_FOLDER: { type: String },
      EMARGEMENTSANIM_FOLDER: { type: String },
      EMARGEMENTS_UNZIP_FOLDER: { type: String },
      EMARGEMENTSANIM_UNZIP_FOLDER: { type: String },
      EMARGEMENTS_EXPORT_PDF: { type: String },
      APK_FOLDER: { type: String },
      APK_NAME: { type: String },
      CLIENT_FOLDER: { type: String },
      FOLDER_ASSETS: { type: String },
      MAX_FILE_SIZE_MO: { type: Number, default: 5 },
      NOM_ASSO: { type: String },
      SIGNATURE_GENERIQUE: { type: String },
    },
    tokenConfig: {
      SECRET_TOKEN: { type: String, required: true },
      SECRET_REFRESH_TOKEN: { type: String, required: true },
      ACCESS_TOKEN_EXPIRE_SECOND: { type: Number, default: 3600 },
      REFRESH_TOKEN_EXPIRE_DAY: { type: Number, default: 7 },
      JWT_EXPIRE_HOUR: { type: Number, default: 1 },
      ALGORITHM: { type: String, default: 'HS256' },
    },
    passwordConfig: {
      SALT_ROUND: { type: Number, default: 10 },
    },
    encryptionConfig: {
      ENCKEY: { type: String, required: true },
      SIGKEY: { type: String, required: true },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'tenantconfigs',
  },
);
