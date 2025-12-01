/**
 * Error Handler Middleware
 * Centralized error handling for consistent API responses
 */
const { AppError } = require('./errors');
const config = require('../config');

/**
 * Handle 404 Not Found for unmatched routes
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} không tồn tại.`
    }
  });
}

/**
 * Handle async route errors
 * Wraps async route handlers to catch errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Main error handler middleware
 * Must be registered LAST in the middleware chain
 */
function errorHandler(err, req, res, next) {
  // Log error for debugging
  if (config.nodeEnv !== 'test') {
    console.error('[Error]', {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      error: err.message,
      stack: config.nodeEnv === 'development' ? err.stack : undefined
    });
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle MySQL/MariaDB specific errors
  if (err.code || err.errno) {
    const errorCode = err.code || '';
    const errorNum = err.errno || 0;
    
    // ER_DUP_ENTRY (1062) - Duplicate entry
    if (errorCode === 'ER_DUP_ENTRY' || errorNum === 1062) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Tài nguyên đã tồn tại.'
        }
      });
    }
    
    // ER_NO_REFERENCED_ROW_2 (1452) - Foreign key constraint fails
    if (errorCode === 'ER_NO_REFERENCED_ROW_2' || errorNum === 1452) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FOREIGN_KEY_VIOLATION',
          message: 'Không thể thực hiện vì có dữ liệu liên quan.'
        }
      });
    }
    
    // ER_BAD_NULL_ERROR (1048) - Column cannot be null
    if (errorCode === 'ER_BAD_NULL_ERROR' || errorNum === 1048) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Thiếu thông tin bắt buộc.'
        }
      });
    }

    // Connection errors
    if (errorCode === 'ECONNREFUSED' || errorCode === 'ENOTFOUND') {
      return res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Không thể kết nối đến cơ sở dữ liệu.'
        }
      });
    }
  }

  // Handle JSON parsing errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Body request không phải JSON hợp lệ.'
      }
    });
  }

  // Handle payload too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Dữ liệu gửi lên quá lớn.'
      }
    });
  }

  // Default to 500 Internal Server Error
  const statusCode = err.statusCode || err.status || 500;
  const message = config.nodeEnv === 'production' 
    ? 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.'
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
      ...(config.nodeEnv === 'development' && { stack: err.stack })
    }
  });
}

module.exports = {
  notFoundHandler,
  asyncHandler,
  errorHandler
};
