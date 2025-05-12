const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// 현재 사용자 정보 조회
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userBadges: {
          include: {
            badge: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 민감한 정보 제외
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      image: user.image,
      contribution: user.contribution,
      badges: user.userBadges.map(ub => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        image: ub.badge.image
      })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.json({
      success: true,
      data: userProfile
    });
    
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '사용자 정보 조회 중 오류가 발생했습니다.'
    });
  }
};

// 사용자 프로필 업데이트
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, title, image } = req.body;
    
    // 업데이트할 필드 정의
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (title) updateData.title = title;
    if (image) updateData.image = image;
    
    // 이메일 변경 시 중복 검사
    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: '이미 사용 중인 이메일입니다.'
        });
      }
    }
    
    // 프로필 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        userBadges: {
          include: {
            badge: true
          }
        }
      }
    });
    
    // 민감한 정보 제외
    const userProfile = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      title: updatedUser.title,
      image: updatedUser.image,
      contribution: updatedUser.contribution,
      badges: updatedUser.userBadges.map(ub => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        image: ub.badge.image
      })),
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };
    
    res.json({
      success: true,
      data: userProfile
    });
    
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      error: '프로필 업데이트 중 오류가 발생했습니다.'
    });
  }
};

// 비밀번호 변경
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // 유효성 검사
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: '모든 필드를 입력해주세요.'
      });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: '새 비밀번호가 일치하지 않습니다.'
      });
    }
    
    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    // 현재 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: '현재 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 새 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 비밀번호 업데이트
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    
    res.json({
      success: true,
      data: {
        message: '비밀번호가 성공적으로 변경되었습니다.'
      }
    });
    
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    res.status(500).json({
      success: false,
      error: '비밀번호 변경 중 오류가 발생했습니다.'
    });
  }
};

// 사용자 목록 조회 (관리자용)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    // 페이지네이션된 사용자 목록 조회
    const users = await prisma.user.findMany({
      skip: parseInt(skip),
      take: parseInt(limit),
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        title: true,
        image: true,
        contribution: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // 전체 사용자 수 조회
    const totalUsers = await prisma.user.count();
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: totalUsers,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalUsers / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '사용자 목록 조회 중 오류가 발생했습니다.'
    });
  }
}; 