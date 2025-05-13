/**
 * 전역 에러 핸들러 미들웨어
 */
const errorMiddleware = (err, req, res, next) => {
  console.error('에러 발생:', err);

  // Prisma 에러 처리
  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: '중복된 값이 존재합니다.'
      });
    } else if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: '요청하신 리소스를 찾을 수 없습니다.'
      });
    }
  }

  // 커스텀 에러 처리
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  // 기본 500 에러 응답
  res.status(500).json({
    success: false,
    error: '서버 내부 오류가 발생했습니다.'
  });
};

module.exports = errorMiddleware; 