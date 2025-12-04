// Couche de compatibilite pour les tests
const path = require('path');

if (process.env.NODE_ENV == "test" && process.env.IS_LOCAL != "1")
    require('dotenv').config({ path: path.join(process.cwd(), 'test.env') });
else if (process.env.NODE_ENV == "test" && process.env.IS_LOCAL == "1")
    require('dotenv').config({ path: path.join(process.cwd(), 'test.local.env') });
else
    require('dotenv').config({ path: path.join(process.cwd(), '.env') });

exports.mongoConf = {
    DB_NAME: process.env.MONGO_DB,
    USERNAME: process.env.MONGO_USERNAME,
    PASS: process.env.MONGO_PASS,
    SERVER: process.env.MONGO_SERVER,
    PORT: process.env.MONGO_PORT,
    ENCKEY: process.env.ENCKEY,
    SIGKEY: process.env.SIGKEY,
    USE_SSL: process.env.MONGO_USE_SSL
};

exports.appConf = {
    PORT: process.env.APP_PORT,
    ENV: process.env.NODE_ENV,
    API_ROUTE: (process.env.API_ROUTE || '').replace("/", ""),
    DEBUG: process.env.DEBUG,
};

exports.tokenConf = {
    ACCESS_TOKEN_EXPIRE_SECOND: process.env.ACCESS_TOKEN_EXPIRE_SECOND,
    REFRESH_TOKEN_EXPIRE_DAY: process.env.REFRESH_TOKEN_EXPIRE_DAY,
    SECRET_TOKEN: process.env.SECRET_TOKEN,
    SECRET_REFRESH_TOKEN: process.env.SECRET_REFRESH_TOKEN,
    JWT_EXPIRE_HOUR: process.env.JWT_EXPIRE_HOUR,
    ALGORITHM: process.env.ALGORITHM
};

exports.passwordConf = {
    SALT_ROUND: process.env.SALT_ROUND
};
