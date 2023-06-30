const Sequelize = require('sequelize');
const db = require('../config/database');

const Task = db.define('task', {
  task_id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  author: {
    type: Sequelize.STRING,
    references: {
      model: 'ServiceUser',
      key: 'username',
    },
  },
  organization: {
    type: Sequelize.STRING,
    references: {
      model: 'Organization',
      key: 'organization',
    },
  },
  task_title: {
    type: Sequelize.STRING,
  },
  task_descr: {
    type: Sequelize.STRING,
  },
  severity: { type: Sequelize.BIGINT },
  created_at: { type: Sequelize.DATE },
});

module.exports = Task;
