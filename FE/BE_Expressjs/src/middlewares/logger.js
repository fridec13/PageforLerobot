const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

// 로그 디렉토리 확인 및 생성
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * 로그 파일에 메시지 기록
 * @param {string} message - 로그 메시지
 * @param {string} level - 로그 레벨 (info, error 등)
 */
const writeLog = (message, level = 'info') => {
  const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  
  // 로그 파일명 (날짜별)
  const today = format(new Date(), 'yyyy-MM-dd');
  const logFile = path.join(logDir, `${today}.log`);
  
  // 로그 파일에 기록
  fs.appendFile(logFile, logMessage, (err) => {
    if (err) {
      console.error('로그 파일 기록 중 오류:', err);
    }
  });
  
  // 콘솔에도 출력 (개발 환경에서만)
  if (process.env.NODE_ENV !== 'production') {
    console.log(logMessage);
  }
};

/**
 * API 요청 로깅 미들웨어
 */
const requestLogger = (req, res, next) => {
  const { method, originalUrl, ip } = req;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  
  // 요청 시작 시간 기록
  req.startTime = Date.now();
  
  // 응답이 완료된 후 로그 기록
  res.on('finish', () => {
    const responseTime = Date.now() - req.startTime;
    const message = `${method} ${originalUrl} - ${res.statusCode} - ${responseTime}ms - ${ip} - ${userAgent}`;
    writeLog(message, res.statusCode >= 400 ? 'warn' : 'info');
  });
  
  next();
};

/**
 * 에러 로깅 미들웨어
 */
const errorLogger = (err, req, res, next) => {
  const { method, originalUrl, ip } = req;
  const message = `${method} ${originalUrl} - ERROR: ${err.message} - ${ip}`;
  
  writeLog(message, 'error');
  
  // 스택 트레이스도 로깅
  if (err.stack) {
    writeLog(`Stack Trace: ${err.stack}`, 'error');
  }
  
  next(err);
};

module.exports = {
  requestLogger,
  errorLogger,
  writeLog
}; 