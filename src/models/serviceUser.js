const Sequelize = require('sequelize')
const db = require('../config/database')

// service_id serial PRIMARY KEY,
//     username VARCHAR(255) UNIQUE NOT NULL,
//     password VARCHAR(255) NOT NULL,
//     salt VARCHAR(4) NOT NULL,
//     email CITEXT NOT NULL,
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
