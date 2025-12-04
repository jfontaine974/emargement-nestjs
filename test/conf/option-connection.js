const optionsConnection = {
    useNewUrlParser: true,
    autoReconnect: true,
    keepAlive: true,
    keepAliveInitialDelay: 300000,
    autoIndex: false,
    useFindAndModify: false,
    retryWrites: false,
    useUnifiedTopology: true,
    ssl: true,
    sslValidate: false,
};

module.exports = optionsConnection;