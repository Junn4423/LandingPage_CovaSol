/**
 * Custom Application Errors
 * Standardized error classes for consistent API responses
 */

/**
 * Base application error
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message
      }
    };
  }
}

/**
 * 400 Bad Request - Invalid input or missing required fields
 */
class ValidationError extends AppError {
  constructor(message = 'Dữ liệu không hợp lệ.', details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }

  toJSON() {
    const json = super.toJSON();
    if (this.details) {
      json.error.details = this.details;
    }
    return json;
  }
}

/**
 * 401 Unauthorized - Authentication required
 */
class AuthenticationError extends AppError {
  constructor(message = 'Vui lòng đăng nhập.') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * 403 Forbidden - Insufficient permissions
 */
class AuthorizationError extends AppError {
  constructor(message = 'Bạn không có quyền thực hiện thao tác này.') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * 404 Not Found - Resource does not exist
 */
class NotFoundError extends AppError {
  constructor(resource = 'Tài nguyên', message = null) {
    super(message || `Không tìm thấy ${resource}.`, 404, 'NOT_FOUND');
    this.resource = resource;
  }
}

/**
 * 409 Conflict - Resource already exists or state conflict
 */
class ConflictError extends AppError {
  constructor(message = 'Tài nguyên đã tồn tại.') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
class RateLimitError extends AppError {
  constructor(message = 'Quá nhiều yêu cầu. Vui lòng thử lại sau.', retryAfter = 60) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.retryAfter = retryAfter;
  }
}

/**
 * 500 Internal Server Error - Unexpected error
 */
class InternalError extends AppError {
  constructor(message = 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.') {
    super(message, 500, 'INTERNAL_ERROR');
  }
}

/**
 * 503 Service Unavailable - Database or external service down
 */
class ServiceUnavailableError extends AppError {
  constructor(message = 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalError,
  ServiceUnavailableError
};
