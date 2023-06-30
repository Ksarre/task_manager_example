// TODO: need organization checks and role checks
// Include auth
const express = require('express');
const authenticationMiddleware = require('../../JWT/authenticationMiddleware');

const router = express.Router();

const sendResponse = require('../../util/responseFormat');
const { loggingEntryMiddleware } = require('../../util/logger');
const { add, remove } = require('./repository');
const { logger } = require('../../util/logger');

// Check JWT for cached data. If none reject the request
router
  .post('/organization/c', authenticationMiddleware, loggingEntryMiddleware, (req, res, next) => {
    add(req.body.orgName, req.userData.username)
      .then((result) => sendResponse(res, 200, result))
      .catch((err) => next(err));
  })
  .delete(
    '/organization/:id',
    authenticationMiddleware,
    loggingEntryMiddleware,
    (req, res, next) => {},
    // should delete tickets, comments, and user to org records
  );

module.exports = router;
