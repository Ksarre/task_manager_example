const express = require('express')
const bcrypt = require('bcrypt')
const { signTokens } = require('../../JWT/authenticationMiddleware')

const router = express.Router()

const ApiError = require('../../error/api_error')
const { logger } = require('../../util/logger')
const { client: redis } = require('../../config/redis')

const userRepository = require('../user/repository')

const sendResponse = require('../../util/responseFormat')

// Route to create an access and refresh token
router.post('/login', (req, res, next) => {
    logger.info(`Login @user: ${req.body.username}`)

    const plaintextPassword = req.body.password

    userRepository
        .getHash(req.body.username)
        .then((userHash) => {
            logger.info(`Retrieving hash. @user: ${req.body.username}`)
            return bcrypt.compare(plaintextPassword, userHash.user_hash)
        })
        .then((compare) => {
            logger.info(`Hash retrieved. @user: ${req.body.username}`)
            if (compare) {
                logger.info({
                    message: 'Retrieving roles',
                    Target: 'Postgres',
                    user: req.body.username,
                })
                return userRepository.getOrgRoles(req.body.username)
            }
            throw ApiError.UnauthorizedError(
                'Invalid username or password. Please try again.',
            )
        })
        .then((orgData) => {
            logger.info({
                message: 'Roles retrieved.',
                Target: 'Postgres',
                user: req.body.username,
            })
            const tokens = signTokens(req)

            Promise.all([
                redis
                    .set(
                        `${req.body.username}Token`,
                        JSON.stringify(tokens.refreshToken),
                    )
                    .then(
                        logger.info({
                            message: ' Setting token',
                            Target: 'Redis',
                            user: req.body.username,
                        }),
                    )
                    .catch((err) => {
                        logger.error({
                            message: 'Failed to set token.',
                            Target: 'Redis',
                            user: req.body.username,
                            error: err,
                        })
                    }),
                redis
                    .set(`${req.body.username}Roles`, JSON.stringify(orgData))
                    .then(
                        logger.info({
                            message: 'Setting roles',
                            Target: 'Redis',
                            user: req.body.username,
                        }),
                    )
                    .catch((err) => {
                        logger.error({
                            message: 'Failed to set roles.',
                            Target: 'Redis',
                            user: req.body.username,
                            error: err,
                        })
                    }),
            ])
            return tokens
        })
        .then((tokens) => {
            logger.info({
                message: 'Login successful',
                user: req.body.username,
            })
            sendResponse(res, 200, {
                message: 'Login successful.',
                token: tokens.accessToken,
            })
        })
        .catch((err) => next(err))
})

module.exports = router
