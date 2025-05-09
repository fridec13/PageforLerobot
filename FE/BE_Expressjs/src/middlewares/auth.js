const jwt = require('jsonwebtoken');
const { User } = require('../models');

// JWT 토큰 확인 미들웨어
const authMiddleware = async (req, res, next) => {
  try {
    // 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: '인증이 필요합니다.' 
      });
    }
    
    const token = authHeader.substring(7); // 'Bearer ' 이후의 토큰 값
    
    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    
    // 사용자 정보 조회
    const user = await User.findOne({ where: { id: decoded.id } });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: '사용자를 찾을 수 없습니다.' 
      });
    }
    
    // 요청 객체에 사용자 정보 추가
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: '인증이 만료되었습니다. 다시 로그인해주세요.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: '유효하지 않은 토큰입니다.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: '인증 처리 중 오류가 발생했습니다.' 
    });
  }
};

// 역할 기반 권한 확인 미들웨어
authMiddleware.hasRole = (roles = []) => {
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

module.exports = authMiddleware; 