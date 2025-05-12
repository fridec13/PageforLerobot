const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// 회원가입
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    
    // 유효성 검사
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: '모든 필드를 입력해주세요.'
      });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: '비밀번호가 일치하지 않습니다.'
      });
    }
    
    // 이메일 중복 검사
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: '이미 사용 중인 이메일입니다.'
      });
    }
    
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image: `https://api.dicebear.com/7.x/lorelei/svg?seed=${Date.now()}`
      }
    });
    
    res.status(201).json({
      success: true,
      data: { 
        message: '회원가입이 완료되었습니다. 로그인해주세요.'
      }
    });
    
  } catch (error) {
    console.error('회원가입 처리 오류:', error);
    res.status(500).json({
      success: false,
      error: '회원가입 처리 중 오류가 발생했습니다.'
    });
  }
};

// 로그인
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 유효성 검사
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '이메일과 비밀번호를 입력해주세요.'
      });
    }
    
    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 마지막 로그인 시간 업데이트
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });
    
    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    // 민감한 정보 제외하고 반환
    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      image: user.image,
      contribution: user.contribution
    };
    
    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });
    
  } catch (error) {
    console.error('로그인 처리 오류:', error);
    res.status(500).json({
      success: false,
      error: '로그인 처리 중 오류가 발생했습니다.'
    });
  }
}; 