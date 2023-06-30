const { UniqueConstraintError } = require('sequelize');
const ServiceUser = require('../../models/serviceUser');
const ServiceUserToOrganization = require('../../models/serviceUserToOrganization');

const DBError = require('../../error/db_error');
const { logger } = require('../../util/logger');
const { convertRaw } = require('../../util/dbUtils');

// result set is in the form []

async function getHash(username) {
  return ServiceUser.findAll({
    attributes: ['user_hash'],
    where: { username },
  }).then((result) => {
    if (result.length === 1) {
      return result[0];
    }
    return { user_hash: '' };
  });
}

async function getOrgRoles(username) {
  return ServiceUserToOrganization.findAll({
    where: { username },
  }).then((data) => convertRaw(data));
}

async function create(user) {
  return ServiceUser.create(user)
    .then()
    .catch((err) => {
      logger.info('Outside the instanceof check');
      logger.info(err);
      if (err instanceof UniqueConstraintError) {
        logger.info('Inside the instanceof check');
        err.errors?.forEach((e) => {
          if (e.path === 'email') {
            throw DBError.DuplicateEmailError(user.email);
          }
          if (e.path === 'username') {
            throw DBError.DuplicateUsernameError(user.username);
          }
        });
      }
      throw err;
    });
}

module.exports = { getHash, create, getOrgRoles };
