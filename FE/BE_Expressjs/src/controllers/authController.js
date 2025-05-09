const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');

// JWT 토큰 생성 유틸리티 함수
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET || 'your_jwt_secret_key',
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '1d' 
    }
  );
};

// 비밀번호 해싱 함수
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// 비밀번호 검증 함수
const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// 회원가입
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // 필수 필드 검증
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: '이름, 이메일, 비밀번호는 필수 입력항목입니다.'
      });
    }
    
    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: '이미 등록된 이메일입니다.'
      });
    }
    
    // 비밀번호 해싱
    const hashedPassword = await hashPassword(password);
    
    // 새 사용자 생성
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
        title: '새싹',
        contribution: 0
      }
    });
    
    // 민감한 정보 제외한 사용자 데이터
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      contribution: user.contribution,
      createdAt: user.createdAt
    };
    
    // 토큰 생성
    const token = generateToken(user);
    
    res.status(201).json({
      success: true,
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
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
    
    // 필수 필드 검증
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
    
    // 사용자가 존재하지 않거나 비밀번호가 일치하지 않는 경우
    if (!user || !(await comparePassword(password, user.password))) {
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
    
    // 민감한 정보 제외한 사용자 데이터
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      image: user.image,
      contribution: user.contribution
    };
    
    // 토큰 생성
    const token = generateToken(user);
    
    res.status(200).json({
      success: true,
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({
      success: false,
      error: '로그인 처리 중 오류가 발생했습니다.'
    });
  }
};

// 비밀번호 변경 요청
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: '이메일을 입력해주세요.'
      });
    }
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '해당 이메일을 가진 사용자를 찾을 수 없습니다.'
      });
    }
    
    // 실제 구현에서는 비밀번호 재설정 토큰 생성 및 이메일 발송 로직 추가
    // 여기서는 간단히 성공 응답만 반환
    
    res.status(200).json({
      success: true,
      message: '비밀번호 재설정 안내가 이메일로 발송되었습니다.'
    });
  } catch (error) {
    console.error('비밀번호 변경 요청 오류:', error);
    res.status(500).json({
      success: false,
      error: '비밀번호 변경 요청 처리 중 오류가 발생했습니다.'
    });
  }
};

// 비밀번호 재설정
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: '토큰과 새 비밀번호가 필요합니다.'
      });
    }
    
    // 실제 구현에서는 토큰 검증 및 비밀번호 재설정 로직 추가
    // 여기서는 간단히 성공 응답만 반환
    
    res.status(200).json({
      success: true,
      message: '비밀번호가 성공적으로 재설정되었습니다. 새 비밀번호로 로그인해주세요.'
    });
  } catch (error) {
    console.error('비밀번호 재설정 오류:', error);
    res.status(500).json({
      success: false,
      error: '비밀번호 재설정 처리 중 오류가 발생했습니다.'
    });
  }
}; 