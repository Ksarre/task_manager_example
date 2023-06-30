const Sequelize = require('sequelize');
const db = require('../config/database');

const Organization = db.define('organization', {
  org_name: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
});

module.exports = Organization;
