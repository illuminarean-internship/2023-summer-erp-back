/* eslint-disable max-classes-per-file */
import httpStatus from 'http-status';

class ExtendableError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.status = statusCode;
    Error.captureStackTrace(this, this.constructor.name);
  }
}

class APIError extends ExtendableError {
  constructor(message, statusCode = httpStatus.INTERNAL_SERVER_ERROR) {
    super(message, statusCode);
  }
}

export default APIError;
