const express = require('express');

const router = express.Router();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const ApiError = require('../../error/api_error');
const { logger } = require('../../util/logger');

const userRepository = require('../user/repository');

const sendResponse = require('../../util/responseFormat');

router.post('/login', (req, res, next) => {
  logger.info(`Login @user: ${req.body.username}`);
  const user = { username: req.body.username };
  const plaintextPassword = req.body.password;

  userRepository
    .getHash(user.username)
    .then((userHash) => {
      logger.info(`Retrieving hash. @user: ${req.body.username}`);
      return bcrypt.compare(plaintextPassword, userHash.user_hash);
    })
    .then((compare) => {
      logger.info(`Hash retrieved. @user: ${req.body.username}`);
      if (compare) {
        // identity proven. fetch all organizations and permissions; append to user
        logger.info(`Retrieving roles. @user: ${req.body.username}`);
        return userRepository.getOrgRoles(user.username);
      }
      throw ApiError.UnauthorizedError('Invalid username or password. Please try again.');
    })
    .then((orgData) => {
      logger.info(`Roles retrieved. @user: ${req.body.username}`);
      // TODO: store role data in redis rather than on the JWT
      user.orgData = orgData;
      logger.info(`Assigning token. @user: ${req.body.username}`);
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m',
      });
      logger.info(`Login successful. @user: ${req.body.username}`);
      sendResponse(res, 200, {
        message: 'Login successful.',
        access_token: accessToken,
      });
    })
    .catch((err) => next(err));
});

module.exports = router;
