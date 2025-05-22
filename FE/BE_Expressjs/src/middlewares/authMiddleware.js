const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * JWT 토큰을 검증하고 사용자 정보를 요청 객체에 추가하는 미들웨어
 * 인증이 필요한 라우트에 적용
 */
const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: '인증 토큰이 제공되지 않았습니다.'
      });
    }

    // Bearer 스키마 확인
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: '잘못된 토큰 형식입니다.'
      });
    }

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');

    // 토큰에서 사용자 ID 추출
    const userId = decoded.id || decoded.userId;

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        title: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: '유효하지 않은 사용자입니다.'
      });
    }

    // 요청 객체에 사용자 정보 추가
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: '토큰이 만료되었습니다.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: '유효하지 않은 토큰입니다.'
      });
    }
    
    next(error);
  }
};

/**
 * JWT 토큰이 있으면 검증하고 사용자 정보를 요청 객체에 추가하는 미들웨어
 * 토큰이 없어도 다음 미들웨어로 진행
 * 인증이 선택적인 라우트에 적용
 */
const optionalAuthenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 토큰이 없으면 그냥 진행
    if (!authHeader) {
      return next();
    }

    // Bearer 스키마 확인
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');

    // 토큰에서 사용자 ID 추출
    const userId = decoded.id || decoded.userId;

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        title: true
      }
    });

    if (user) {
      // 요청 객체에 사용자 정보 추가
      req.user = user;
    }
    
    next();
  } catch (error) {
    // 토큰 검증 실패 시에도 다음 미들웨어로 진행
    next();
  }
};

/**
 * 관리자 권한을 확인하는 미들웨어
 * 관리자 전용 라우트에 적용
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: '관리자 권한이 필요합니다.'
    });
  }
  
  next();
};

/**
 * 특정 역할을 가진 사용자만 접근 가능한 미들웨어
 * @param {string[]} roles - 허용할 역할 배열
 * @returns {function} 미들웨어 함수
 */
const hasRole = (roles = []) => {
  return (req, res, next) => {
    // 이미 인증 미들웨어를 통과했으므로 req.user가 있음을 가정
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: '인증이 필요합니다.' 
      });
    }
    
    // 사용자 역할 확인
    const hasPermission = roles.includes(req.user.role);
    
    if (!hasPermission) {
      return res.status(403).json({ 
        success: false, 
        error: '접근 권한이 없습니다.' 
      });
    }
    
    next();
  };
};

module.exports = {
  authenticateJWT,
  optionalAuthenticateJWT,
  requireAdmin,
  hasRole
}; 