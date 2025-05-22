const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 선택적 인증 미들웨어
 * 토큰이 없거나 유효하지 않더라도 요청을 차단하지 않음
 */
const optionalAuth = async (req, res, next) => {
  try {
    // 요청 헤더에서 토큰 가져오기
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN 형식에서 TOKEN 추출
    
    // 토큰이 없으면 인증 없이 계속
    if (!token) {
      req.isAuthenticated = false;
      req.user = null;
      return next();
    }
    
    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        username: true,
        image: true,
        level: {
          select: {
            name: true,
            color: true
          }
        }
      }
    });
    
    // 사용자가 존재하지 않으면 인증 없이 계속
    if (!user) {
      req.isAuthenticated = false;
      req.user = null;
      return next();
    }
    
    // 요청 객체에 인증 정보 추가
    req.isAuthenticated = true;
    req.user = user;
    
    next();
  } catch (error) {
    // 토큰이 유효하지 않더라도 인증 없이 계속
    req.isAuthenticated = false;
    req.user = null;
    next();
  }
};

module.exports = optionalAuth; 