const ApiError = require('./api_error')
const { logger } = require('../util/logger')

function errorResponse(type, message) {
    return {
        type,
        message,
    }
}

function ApiErrorMiddleware(err, req, res, next) {
    if (err instanceof ApiError) {
        logger.error(err)
        res.status(err.code).json(errorResponse(err.name, err.message))
    } else {
        logger.error(err)
        res.status(500).json(
            errorResponse(
                'ServerException',
                "Sorry. We're not sure what happened.",
            ),
        )
    }
    next()
}

module.exports = ApiErrorMiddleware
