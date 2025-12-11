// Custom Error Class
// Extends native Error class with status code support
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle Mongoose Validation Errors
// Takes Mongoose validation error and returns formatted AppError
function handleValidationError(err) {
  const errors = Object.values(err.errors).map((error) => error.message);
  const message = `Validation failed: ${errors.join(", ")}`;
  return new AppError(message, 400);
}

// Handle Mongoose Duplicate Key Errors
// Takes Mongoose duplicate key error and returns formatted AppError
function handleDuplicateKeyError(err) {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate value for field '${field}': ${value}. Please use another value`;
  return new AppError(message, 400);
}

// Handle Mongoose Cast Errors (Invalid ObjectId)
// Takes Mongoose cast error and returns formatted AppError
function handleCastError(err) {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
}

module.exports = {
  AppError,
  handleValidationError,
  handleDuplicateKeyError,
  handleCastError,
};
