const Sequelize = require('sequelize')
const db = require('../config/database')

const ServiceUser = db.define('service_user', {
    username: {
        type: Sequelize.BIGINT,
        primaryKey: true,
    },
    registered_on: { type: Sequelize.DATE },
    user_hash: { type: Sequelize.STRING },
    email: { type: Sequelize.STRING },
})

module.exports = ServiceUser
