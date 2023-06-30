const Task = require('./task');
const ServiceUser = require('./serviceUser');
const Organization = require('./organization');
const ServiceUserToOrganization = require('./serviceUserToOrganization');

const associations = {
  serviceUserToTask: () => {
    ServiceUser.hasMany(Task, { sourceKey: 'username', foreignKey: 'author' });
    Task.belongsTo(ServiceUser, { as: 'task_author', targetKey: 'username', foreignKey: 'author' });
  },
  organizationToTask: () => {
    Organization.hasMany(Task, { sourceKey: 'org_name', foreignKey: 'organization' });
    Task.belongsTo(Organization, { as: 'org', targetKey: 'org_name', foreignKey: 'organization' });
  },
  userToOrganization: () => {
    Organization.belongsToMany(ServiceUser, {
      through: ServiceUserToOrganization,
      foreignKey: 'organization',
    });
    ServiceUser.belongsToMany(Organization, {
      through: ServiceUserToOrganization,
      foreignKey: 'username',
    });
  },
};

const setAssociations = (as) => {
  if (!(as instanceof Object)) {
    throw TypeError("parameter 'as' should be an associations object");
  }
  Object.keys(as).forEach((key) => {
    if (as[key] instanceof Function) {
      as[key]();
    }
  });
};

const defaultAssociations = () => {
  setAssociations(associations);
};

module.exports = defaultAssociations;
