const ApiError = require('./api_error')

class DBError extends ApiError {
    constructor(code, message, type, wrappedError) {
        super(message)
        this.code = code
        this.wrappedError = wrappedError
        this.message = message
        this.type = type
    }

    static DuplicateEmailError(email, wrappedError = null) {
        return new DBError(
            400,
            `User with email ${email} already exists`,
            'DuplicateEmailError',
            wrappedError,
        )
    }

    static DuplicateUsernameError(username, wrappedError = null) {
        return new DBError(
            400,
            `User with username ${username} already exists`,
            'DuplicateUsernameError',
            wrappedError,
        )
    }
}

module.exports = DBError
