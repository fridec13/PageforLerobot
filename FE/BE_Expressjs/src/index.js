const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');
const routes = require('./routes');

// 환경 변수 로드
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(helmet()); // 보안 헤더 설정
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev')); // 로깅
app.use(express.json()); // JSON 요청 본문 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩된 요청 본문 파싱

// API 라우트 설정
app.use('/api', routes);

// 404 에러 처리
app.use((req, res) => {
  res.status(404).json({ message: '요청한 리소스를 찾을 수 없습니다.' });
});

// 오류 처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || '서버 내부 오류가 발생했습니다.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 데이터베이스 연결 및 서버 시작
const startServer = async () => {
  try {
    // 데이터베이스 연결 및 모델 동기화
    await sequelize.authenticate();
    console.log('데이터베이스 연결 성공');
    
    // 개발 환경에서만 테이블 동기화 (프로덕션에서는 마이그레이션 사용 권장)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true }); // 기존 테이블 구조 변경 허용
      console.log('데이터베이스 모델 동기화 완료');
    }
    
    // 서버 시작
    app.listen(PORT, () => {
      console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    });
  } catch (error) {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  }
};

startServer(); 