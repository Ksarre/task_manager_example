const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const { getIP } = require('../util/APIUtils')
const ApiError = require('../error/api_error')
const { logger } = require('../util/logger')
const { client: redis } = require('../config/redis')

const verify = promisify(jwt.verify)

// Checks that a request provides a proper auth header
function validateAuthHeader(req) {
    const authHeader = req.headers.Authorization || req.headers.authorization

    if (authHeader == null)
        throw ApiError.UnauthorizedError('Authorization header missing')
    const token = authHeader.split(' ')[1]
    if (token == null)
        throw ApiError.UnauthorizedError('Malformed authorization header')
    return token
}

const accessTokenExpiry = '30m'
const refreshTokenExpiry = '1d'

function signTokens(req) {
    const user = { username: req.body.username, ip: req.ip }
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: accessTokenExpiry,
    })
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: refreshTokenExpiry,
    })
    return { accessToken, refreshToken }
}

function signAccessToken(username, ip) {
    const user = { username, ip }
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: accessTokenExpiry,
    })

    return accessToken
}

async function getRefreshToken(decodedAccessToken) {
    if (!redis.isReady) await redis.connect()
    const results = await redis.get(`${decodedAccessToken.username}Token`)
    return results
}

async function verifyRefreshToken(decodedAccessToken) {
    const results = await getRefreshToken(decodedAccessToken)

    logger.info({ results, target: 'Redis' })

    const decodedRefreshToken = await verify(
        JSON.parse(results),
        process.env.REFRESH_TOKEN_SECRET,
    )
    return decodedRefreshToken
}

function authenticate(req, res, next) {
    const token = validateAuthHeader(req)
    req.userData = {}

    verify(token, process.env.ACCESS_TOKEN_SECRET)
        .then((decodedToken) => {
            logger.info(
                { user: JSON.stringify(decodedToken) },
                'Authenticated user',
            )
            req.userData = decodedToken
            next()
        })
        .catch((err) => {
            // Internal jwt.verify errors are wrapped with ApiError
            if (err.name === 'TokenExpiredError') {
                const decodedToken = jwt.decode(token)
                logger.info('verifying refresh token')
                // TODO: Need to map the refresh token with latest access token and verify a match
                // otherwise agents can get new access tokens with any out of date access token
                verifyRefreshToken(decodedToken)
                    .then((decodedRefreshToken) => {
                        logger.info('generating new access token')
                        const accessToken = signAccessToken(
                            decodedRefreshToken.username,
                            getIP(req),
                        )
                        logger.info(
                            'Authenticated user',
                            decodedRefreshToken.username,
                        )
                        req.userData = decodedRefreshToken
                        res.append('token', accessToken)
                        next()
                    })
                    .catch((refreshErr) => {
                        next(
                            ApiError.ForbiddenError(
                                `Access to ${req.url} was denied: ${refreshErr.message}`,
                                err,
                            ),
                        )
                    })
            } else if (err.name === 'JsonWebTokenError') {
                next(
                    ApiError.ForbiddenError(
                        `Access to ${req.url} was denied: ${err.message}`,
                        err,
                    ),
                )
            } else {
                logger.info('Unexpected authentication error')
                next(err)
            }
        })
}

module.exports = { authenticate, signAccessToken, signTokens }
