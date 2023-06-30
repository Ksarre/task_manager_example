const jwt = require('jsonwebtoken');
const ApiError = require('../error/api_error');
const { logger } = require('../util/logger');

function validateHeader(req) {
  const authHeader = req.headers.Authorization || req.headers.authorization;

  if (authHeader == null) throw ApiError.UnauthorizedError('Authorization header missing');
  const token = authHeader.split(' ')[1];
  if (token == null) throw ApiError.UnauthorizedError('Malformed authorization header');
  return token;
}

function authenticate(req, res, next) {
  try {
    logger.info('Authenticating user');
    const token = validateHeader(req, next);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, { maxAge: '1d' }, (err, decodedToken) => {
      if (err) {
        throw ApiError.ForbiddenError(`Access to ${req.url} was denied.`);
      }
      logger.info(`Authenticated @user: ${JSON.stringify(decodedToken)}`);
      req.userData = decodedToken;
      next();
    });
  } catch (err) {
    logger.info('Authentication failed.');
    next(err);
  }
}

module.exports = authenticate;
