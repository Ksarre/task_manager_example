const ApiError = require('./api_error');

class DBError extends ApiError {
  constructor(code, message, type) {
    super();
    this.code = code;
    this.message = message;
    this.type = type;
  }

  static DuplicateEmailError(email) {
    return new DBError(400, `User with email ${email} already exists`, 'DuplicateEmailError');
  }

  static DuplicateUsernameError(username) {
    return new DBError(
      400,
      `User with username ${username} already exists`,
      'DuplicateUsernameError',
    );
  }
}

module.exports = DBError;
