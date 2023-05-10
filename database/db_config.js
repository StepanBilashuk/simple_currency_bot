const {Sequelize} = require('sequelize');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'));

module.exports = config;
module.exports = new Sequelize(
    config.dbHostName,
    config.dbUser,
    config.dbPassword,
    {
        host: config.dbHost,
        port: config.dbPort,
        dialect: 'postgres'
    }
);
