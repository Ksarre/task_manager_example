const Sequelize = require('sequelize')
const db = require('../config/database')
const Organization = require('./organization')
const ServiceUser = require('./serviceUser')

const ServiceUserToOrganization = db.define('service_user_to_organization', {
    map_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    organization: {
        type: Sequelize.STRING,
        references: {
            model: Organization,
            key: 'org_name',
        },
    },
    username: {
        type: Sequelize.STRING,
        references: {
            model: ServiceUser,
            key: 'username',
        },
    },
    admin_perm: {
        type: Sequelize.BOOLEAN,
    },
    read_perm: {
        type: Sequelize.BOOLEAN,
    },
    write_perm: {
        type: Sequelize.BOOLEAN,
    },
    del_perm: {
        type: Sequelize.BOOLEAN,
    },
    created_at: { type: Sequelize.DATE },
})

module.exports = ServiceUserToOrganization
