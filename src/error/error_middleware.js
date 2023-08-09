const ApiError = require('./api_error')
const { logger } = require('../util/logger')

function errorResponse(type, message) {
    return {
        type,
        message,
    }
}

// eslint-disable-next-line no-unused-vars
function ApiErrorMiddleware(err, req, res, next) {
    // might send a slack message or an email or just log to aws
    // should also elevate severity of the error if its a runtime error
    if (err instanceof ApiError) {
        logger.error({ code: err.code, type: err.type, message: err.message })
        res.status(err.code).json(errorResponse(err.type, err.message))
    } else {
        logger.error(err)
        res.status(500).json(
            errorResponse(
                'ServerException',
                "Sorry. We're not sure what happened.",
            ),
        )
    }
}

module.exports = ApiErrorMiddleware
