const jwt = require('jsonwebtoken')
const ApiError = require('../error/api_error')
const { logger } = require('../util/logger')

// Checks that a request provides a proper auth header
async function validateHeader(req) {
    const authHeader = req.headers.Authorization || req.headers.authorization

    if (authHeader == null)
        throw ApiError.UnauthorizedError('Authorization header missing')
    const token = authHeader.split(' ')[1]
    if (token == null)
        throw ApiError.UnauthorizedError('Malformed authorization header')
    return token
}

const accessTokenExpiry = '30m'
const refreshTokenExpiry = '5d'

// verify wrapper
async function verifyToken(token, secret, options) {
    return options === undefined
        ? jwt.verify(token, secret)
        : jwt.verify(token, secret, options)
}

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

function signAccessToken(req) {
    const user = { username: req.body.username, ip: req.ip }
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: accessTokenExpiry,
    })

    return accessToken
}

// checks validity of the provided access token
function authenticate(req, res, next) {
    validateHeader(req)
        .then((token) => verifyToken(token, process.env.ACCESS_TOKEN_SECRET))
        .then((decodedToken) => {
            logger.info(`Authenticated @user: ${JSON.stringify(decodedToken)}`)
            req.userData = decodedToken
            next()
        })
        .catch((err) => {
            // wrap with ApiError if its an internal jwt.verify error
            // otherwise go through the normal flow
            const redis = [{}]
            if (err.name === 'TokenExpiredError') {
                verifyToken(redis[0], process.env.REFRESH_TOKEN_SECRET)
                    .then((decodedToken) => {
                        logger.info(
                            `Authenticated @user: ${JSON.stringify(
                                decodedToken,
                            )}`,
                        )
                        req.userData = decodedToken
                        const accessToken = signAccessToken(req)
                        res.json({ token: accessToken })
                        next()
                    })
                    .catch(
                        next(
                            ApiError.ForbiddenError(
                                `Access to ${req.url} was denied.`,
                            ),
                        ),
                    )
            } else if (err.name === 'JsonWebTokenError') {
                next(
                    ApiError.ForbiddenError(`Access to ${req.url} was denied.`),
                )
            } else {
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

module.exports = { authenticate, signAccessToken, signTokens, verifyToken }
