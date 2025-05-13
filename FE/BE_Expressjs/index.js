const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const dotenv = require('dotenv');
const { requestLogger, errorLogger } = require('./src/middlewares/logger');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

// 환경 변수 로드
dotenv.config();

// Prisma 클라이언트 초기화
const prisma = new PrismaClient();

// 라우터 가져오기
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const wikiRoutes = require('./src/routes/wikiRoutes');
const docsRoutes = require('./src/routes/docsRoutes');

const app = express();

// 미들웨어 설정
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// API 요청 로깅 미들웨어 적용
app.use(requestLogger);

// Swagger UI 설정
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API 경로 설정
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wiki', wikiRoutes);
app.use('/api/docs', docsRoutes);

// 건강 체크 엔드포인트
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API 서버가 정상적으로 작동 중입니다.'
  });
});

// 에러 로깅 미들웨어 적용
app.use(errorLogger);

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
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
  
  // 커스텀 에러 상태 코드 처리
  const statusCode = err.statusCode || 500;
  const errorMessage = statusCode === 500 ? '서버에 문제가 발생했습니다.' : err.message;
  
  res.status(statusCode).json({
    success: false,
    error: errorMessage
  });
});

// 존재하지 않는 경로 처리
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '요청한 리소스를 찾을 수 없습니다.'
  });
});

// 서버 시작
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`API 문서는 http://localhost:${PORT}/api-docs 에서 확인할 수 있습니다.`);
});

// 애플리케이션 종료 시 Prisma 연결 해제
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('데이터베이스 연결이 종료되었습니다.');
  process.exit(0);
});
