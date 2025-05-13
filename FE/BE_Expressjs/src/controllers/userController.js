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

// 특정 사용자 정보 조회
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
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
      createdAt: user.createdAt
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

// 내 기여 이력 조회
exports.getMyContributions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * parseInt(limit);
    
    // 기여 이력 조회
    const contributions = await prisma.contribution.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });
    
    // 기여 이력 포맷팅
    const formattedContributions = contributions.map(c => ({
      id: c.id,
      type: c.type.toUpperCase(),
      title: c.description,
      createdAt: c.createdAt
    }));
    
    // 전체 기여 수 조회
    const total = await prisma.contribution.count({
      where: { userId }
    });
    
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      success: true,
      data: {
        items: formattedContributions,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
    
  } catch (error) {
    console.error('기여 이력 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '기여 이력 조회 중 오류가 발생했습니다.'
    });
  }
};

// 칭호 목록 조회
exports.getTitles = async (req, res) => {
  try {
    // 모든 칭호 배열 (일단은 하드코딩, 나중에 DB에서 조회)
    const titles = ['새싹', '성실한 기여자', '지식 전파자', '위키 마스터', 'RoboSSAFYens'];
    
    res.json({
      success: true,
      data: titles
    });
    
  } catch (error) {
    console.error('칭호 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '칭호 목록 조회 중 오류가 발생했습니다.'
    });
  }
};

// 활성 칭호 설정
exports.setActiveTitle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;
    
    // 유효성 검사
    if (!title) {
      return res.status(400).json({
        success: false,
        error: '칭호를 입력해주세요.'
      });
    }
    
    // 사용 가능한 칭호 목록 (일단은 하드코딩)
    const availableTitles = ['새싹', '성실한 기여자', '지식 전파자', '위키 마스터', 'RoboSSAFYens'];
    
    if (!availableTitles.includes(title)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 칭호입니다.'
      });
    }
    
    // 칭호 업데이트
    await prisma.user.update({
      where: { id: userId },
      data: { title }
    });
    
    res.json({
      success: true,
      data: {
        message: '칭호가 성공적으로 변경되었습니다.',
        title
      }
    });
    
  } catch (error) {
    console.error('칭호 변경 오류:', error);
    res.status(500).json({
      success: false,
      error: '칭호 변경 중 오류가 발생했습니다.'
    });
  }
};

// 내 메시지 목록 조회
exports.getMyMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * parseInt(limit);
    
    // 메시지 조회
    const messages = await prisma.message.findMany({
      where: { receiverId: userId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });
    
    // 메시지 포맷팅
    const formattedMessages = messages.map(m => ({
      id: m.id,
      senderId: m.senderId,
      senderName: m.sender.name,
      content: m.content,
      read: m.read,
      createdAt: m.createdAt
    }));
    
    // 전체 메시지 수 조회
    const total = await prisma.message.count({
      where: { receiverId: userId }
    });
    
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      success: true,
      data: {
        items: formattedMessages,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
    
  } catch (error) {
    console.error('메시지 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '메시지 목록 조회 중 오류가 발생했습니다.'
    });
  }
};

// 메시지 읽음 처리
exports.markMessageAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;
    
    // 메시지 조회
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });
    
    // 메시지가 존재하지 않는 경우
    if (!message) {
      return res.status(404).json({
        success: false,
        error: '메시지를 찾을 수 없습니다.'
      });
    }
    
    // 권한 확인 (자신의 메시지만 읽음 처리 가능)
    if (message.receiverId !== userId) {
      return res.status(403).json({
        success: false,
        error: '권한이 없습니다.'
      });
    }
    
    // 읽음 처리
    await prisma.message.update({
      where: { id: messageId },
      data: { 
        read: true,
        readAt: new Date()
      }
    });
    
    res.json({
      success: true,
      data: {
        message: '메시지가 읽음 처리되었습니다.'
      }
    });
    
  } catch (error) {
    console.error('메시지 읽음 처리 오류:', error);
    res.status(500).json({
      success: false,
      error: '메시지 읽음 처리 중 오류가 발생했습니다.'
    });
  }
};

// 메시지 삭제
exports.deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;
    
    // 메시지 조회
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });
    
    // 메시지가 존재하지 않는 경우
    if (!message) {
      return res.status(404).json({
        success: false,
        error: '메시지를 찾을 수 없습니다.'
      });
    }
    
    // 권한 확인 (자신이 받은 메시지만 삭제 가능)
    if (message.receiverId !== userId) {
      return res.status(403).json({
        success: false,
        error: '권한이 없습니다.'
      });
    }
    
    // 메시지 삭제
    await prisma.message.delete({
      where: { id: messageId }
    });
    
    res.json({
      success: true,
      data: {
        message: '메시지가 삭제되었습니다.'
      }
    });
    
  } catch (error) {
    console.error('메시지 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '메시지 삭제 중 오류가 발생했습니다.'
    });
  }
};

// 메시지 전송 (관리자/모더레이터 전용)
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;
    
    // 유효성 검사
    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        error: '받는 사람과 메시지 내용을 모두 입력해주세요.'
      });
    }
    
    // 수신자 존재 여부 확인
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });
    
    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: '받는 사람을 찾을 수 없습니다.'
      });
    }
    
    // 메시지 저장
    const newMessage = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content
      }
    });
    
    res.status(201).json({
      success: true,
      data: {
        message: '메시지가 전송되었습니다.',
        messageId: newMessage.id
      }
    });
    
  } catch (error) {
    console.error('메시지 전송 오류:', error);
    res.status(500).json({
      success: false,
      error: '메시지 전송 중 오류가 발생했습니다.'
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