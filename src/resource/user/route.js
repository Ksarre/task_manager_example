const express = require('express');
const bcrypt = require('bcrypt');
const { logger } = require('../../util/logger');

const router = express.Router();
const { loggingEntryMiddleware } = require('../../util/logger');
const { create } = require('./repository');

const saltRounds = +process.env.SALT_ROUNDS;

router.post('/register', loggingEntryMiddleware, (req, res, next) => {
  logger.info(`Registering user @user:${req.body.username}`);
  // parse out username, password, email
  const prehash = {
    plaintextPassword: req.body.password,
  };

  // generate salt, then append salt to the password, finally hash the result
  logger.info(`Generating salt @user:${req.body.username}`);
  bcrypt
    .genSalt(saltRounds)
    .then((salt) => {
      logger.info(`Generating hash @user:${req.body.username}`);
      bcrypt.hash(prehash.plaintextPassword, salt, (hashErr, hash) => {
        if (hashErr) next(hashErr);
        const user = {
          username: req.body.username,
          email: req.body.email,
          user_hash: hash,
        };
        logger.info(`Creating user @user:${req.body.username}`);
        create(user)
          .then(() => {
            logger.info(`Account created successfully @user:${req.body.username}`);
            res.status(200).json({ Message: 'Account created successfully.' });
          })
          .catch((err) => next(err));
      });
    })
    .catch((err) => next(err));
});

module.exports = router;
