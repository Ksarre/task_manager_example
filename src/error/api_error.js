class ApiError {
  constructor(code, message, type) {
    this.code = code;
    this.message = message;
    this.type = type;
  }

  toString() {
    return JSON.stringify({ message: this.message, type: this.type });
  }

  static NotFoundError(msg = null) {
    return new ApiError(404, msg, 'NotFoundError');
  }

  static ForbiddenError(msg = null) {
    return new ApiError(403, msg, 'ForbiddenError');
  }

  static UnauthorizedError(msg = null) {
    return new ApiError(401, msg, 'UnauthorizedError');
  }

  static ServiceUnavailableError(msg = null) {
    return new ApiError(503, msg, 'UnauthorizedError');
  }
}

module.exports = ApiError;
