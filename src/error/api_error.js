class ApiError extends Error {
    constructor(code, message, name, wrappedError) {
        super(message)
        this.code = code
        if (wrappedError) this.stack += wrappedError.stack
        this.message = message
        this.name = name
    }

    toString() {
        return JSON.stringify({ message: this.message, type: this.name })
    }

    static NotFoundError(msg = null, wrappedError = null) {
        return new ApiError(404, msg, 'NotFoundError', wrappedError)
    }

    static ForbiddenError(msg = null, wrappedError = null) {
        return new ApiError(403, msg, 'ForbiddenError', wrappedError)
    }

    static UnauthorizedError(msg = null, wrappedError = null) {
        return new ApiError(401, msg, 'UnauthorizedError', wrappedError)
    }

    static ServiceUnavailableError(msg = null, wrappedError = null) {
        return new ApiError(503, msg, 'UnauthorizedError', wrappedError)
    }
}

module.exports = ApiError
