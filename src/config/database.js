const Sequelize = require('sequelize');
const { logger } = require('../util/logger');

const db = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PW,
  {
    logging: (msg) => logger.log('debug', msg),
    host: process.env.HOST,
    dialect: 'postgres',
    define: {
      freezeTableName: true,
      timestamps: false,
    },
  },
);
module.exports = db;
