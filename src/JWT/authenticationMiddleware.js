const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const { getIp } = require('../util/APIUtils')
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

const accessTokenExpiry = '1m'
const refreshTokenExpiry = '5m'

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

// throws redis errors and jwt.verify errors
async function verifyRefreshToken(decodedAccessToken) {
    const results = await getRefreshToken(decodedAccessToken)

    logger.info({ results, target: 'Redis' })

    // TODO: Would be helpful to enhance the redis client to JSON.stringify input
    // and JSON.parse output
    const decodedRefreshToken = await verify(
        JSON.parse(results[0]),
        process.env.REFRESH_TOKEN_SECRET,
    )
    return decodedRefreshToken
}

// checks validity of the provided access token
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
            // wrap with ApiError if its an internal jwt.verify error
            if (err.name === 'TokenExpiredError') {
                const decodedToken = jwt.decode(token)
                logger.info('verifying refresh token')
                verifyRefreshToken(decodedToken)
                    .then((decodedRefreshToken) => {
                        logger.info('generating new access token')
                        const accessToken = signAccessToken(
                            decodedRefreshToken.username,
                            getIp(req),
                        )
                        logger.info(
                            'Authenticated user',
                            JSON.stringify(decodedRefreshToken.username),
                        )
                        req.userData = decodedRefreshToken
                        res.append('token', accessToken)
                        next()
                    })
                    .catch((refreshErr) => {
                        // logger.err(err)
                        next(
                            ApiError.ForbiddenError(
                                `Access to ${req.url} was denied.\n ${refreshErr.message}`,
                                err,
                            ),
                        )
                    })
            } else if (err.name === 'JsonWebTokenError') {
                // logger.err(err)
                next(
                    ApiError.ForbiddenError(
                        `Access to ${req.url} was denied.\n ${err.message}`,
                        err,
                    ),
                )
            } else {
                logger.info('Unexpected authentication error')
                next(err)
            }
        })
}

// try {
// logger.info('Authenticating user')
// const token = validateHeader(req)
// jwt.verify(
//     token,
//     process.env.ACCESS_TOKEN_SECRET,
//     (err, decodedToken) => {
//         if (err) {
//             throw ApiError.ForbiddenError(
//                 `Access to ${req.url} was denied.`,
//             )
//         }
//         logger.info(
//             `Authenticated @user: ${JSON.stringify(decodedToken)}`,
//         )
//         req.userData = decodedToken
//         next()
//     },
// )
//     } catch (err) {
//         // TODO: Handle different errors (Expired, untrusted)
//         logger.info('Access token failed.')

//         if (!refreshToken)
//             sendResponse(res, 401, { message: 'No refresh token provided.' })

//         jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err) => {
//             if (err)
//                 sendResponse(res, 403, {
//                     message: 'Refresh token could not be verified.',
//                 })

//             const accessToken = signAccessToken(req)
//             sendResponse(res, 200, {
//                 message: 'Access token refreshed.',
//                 accessToken,
//             })
//         })
//         next()
//         next(err)
//     }
// }

module.exports = { authenticate, signAccessToken, signTokens }
