const winston = require('winston');
const { format } = winston;

// 로그 포맷 설정
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level.toUpperCase()}] ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// 로거 설정
const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        logFormat
      )
    })
  ]
});

// API 요청 로깅 미들웨어
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // 응답이 완료되면 로그 기록
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };

    // 상태 코드에 따라 로그 레벨 결정
    if (res.statusCode >= 500) {
      logger.error('API Error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('API Warning', logData);
    } else {
      logger.info('API Request', logData);
    }
  });

  next();
};

// 에러 로깅 미들웨어
const errorLogger = (err, req, res, next) => {
  logger.error('Unhandled Error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });
  next(err);
};

module.exports = {
  logger,
  requestLogger,
  errorLogger
}; 