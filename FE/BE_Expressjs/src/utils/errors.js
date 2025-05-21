class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = '잘못된 요청입니다.') {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = '인증이 필요합니다.') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = '접근 권한이 없습니다.') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = '요청한 리소스를 찾을 수 없습니다.') {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = '리소스 충돌이 발생했습니다.') {
    super(message, 409);
  }
}

class ValidationError extends AppError {
  constructor(message = '입력값이 유효하지 않습니다.') {
    super(message, 422);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError
}; 