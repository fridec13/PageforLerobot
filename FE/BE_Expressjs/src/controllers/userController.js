const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

// 기본 칭호 목록
const TITLES = [
  '새싹',
  '기여자',
  '위키 편집자',
  '포럼 활동가',
  '전문가',
  '마스터',
  'SAPIENS'
];

// 비밀번호 해싱 함수
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// 현재 로그인한 사용자 정보 조회
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user는 인증 미들웨어에서 이미 설정됨
    const userId = req.user.id;
    
    // 사용자 정보 조회 (Prisma를 사용)
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 민감한 정보 제외한 사용자 데이터
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      image: user.image,
      contribution: user.contribution,
      createdAt: user.createdAt
    };
    
    // 사용자의 뱃지 조회 (참고: Prisma 스키마에 Badge, UserBadge 모델 추가 필요)
    /* 
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: user.id },
      include: {
        badge: true
      }
    });
    
    userData.badges = userBadges.map(ub => ub.badge.name);
    */
    
    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '사용자 정보 조회 중 오류가 발생했습니다.'
    });
  }
};

// 프로필 업데이트
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
    
    // 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });
    
    // 업데이트된 사용자 정보 반환
    const userData = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      title: updatedUser.title,
      image: updatedUser.image,
      contribution: updatedUser.contribution,
      createdAt: updatedUser.createdAt
    };
    
    res.status(200).json({
      success: true,
      data: userData
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
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: '현재 비밀번호와 새 비밀번호가 필요합니다.'
      });
    }
    
    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    // 현재 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: '현재 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 새 비밀번호 해싱
    const hashedPassword = await hashPassword(newPassword);
    
    // 비밀번호 업데이트
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    
    res.status(200).json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    res.status(500).json({
      success: false,
      error: '비밀번호 변경 중 오류가 발생했습니다.'
    });
  }
};

// 기여 내역 조회
exports.getContributions = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const skip = (page - 1) * limit;
    
    // 참고: Prisma 스키마에 Contribution 모델 추가 필요
    /* 
    // 기여 내역 조회
    const contributions = await prisma.contribution.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip
    });
    
    // 총 기여 내역 수 조회
    const totalCount = await prisma.contribution.count({
      where: { userId }
    });
    
    res.status(200).json({
      success: true,
      data: {
        items: contributions,
        total: totalCount,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
    */
    
    // 임시 응답
    res.status(200).json({
      success: true,
      data: {
        items: [],
        total: 0,
        page: page,
        limit: limit,
        totalPages: 0
      }
    });
  } catch (error) {
    console.error('기여 내역 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '기여 내역 조회 중 오류가 발생했습니다.'
    });
  }
};

// 메시지 목록 조회
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const skip = (page - 1) * limit;
    
    // 참고: Prisma 스키마에 Message 모델 추가 필요
    /*
    // 받은 메시지 조회
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
      take: limit,
      skip
    });
    
    // 총 메시지 수 조회
    const totalCount = await prisma.message.count({
      where: { receiverId: userId }
    });
    
    // 응답 형식에 맞게 데이터 변환
    const formattedMessages = messages.map(message => ({
      id: message.id,
      senderId: message.senderId,
      senderName: message.sender.name,
      senderImage: message.sender.image,
      content: message.content,
      read: message.read,
      createdAt: message.createdAt
    }));
    
    res.status(200).json({
      success: true,
      data: {
        items: formattedMessages,
        total: totalCount,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
    */
    
    // 임시 응답
    res.status(200).json({
      success: true,
      data: {
        items: [],
        total: 0,
        page: page,
        limit: limit,
        totalPages: 0
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
    const { id } = req.params;
    
    // 메시지 조회
    const message = await Message.findOne({
      where: {
        id,
        receiverId: req.user.id
      }
    });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: '메시지를 찾을 수 없습니다.'
      });
    }
    
    // 이미 읽은 메시지인 경우
    if (message.read) {
      return res.status(200).json({
        success: true,
        message: '이미 읽은 메시지입니다.'
      });
    }
    
    // 읽음 처리
    await message.update({
      read: true,
      readAt: new Date()
    });
    
    res.status(200).json({
      success: true,
      message: '메시지가 읽음 처리되었습니다.'
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
    const { id } = req.params;
    
    // 메시지 삭제
    const result = await Message.destroy({
      where: {
        id,
        receiverId: req.user.id
      }
    });
    
    if (result === 0) {
      return res.status(404).json({
        success: false,
        error: '메시지를 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: '메시지가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('메시지 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '메시지 삭제 중 오류가 발생했습니다.'
    });
  }
};

// 메시지 전송
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    
    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        error: '수신자 ID와 메시지 내용이 필요합니다.'
      });
    }
    
    // 수신자 확인
    const receiver = await User.findByPk(receiverId);
    
    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: '수신자를 찾을 수 없습니다.'
      });
    }
    
    // 자기 자신에게 메시지 전송 방지
    if (receiverId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: '자신에게 메시지를 보낼 수 없습니다.'
      });
    }
    
    // 메시지 생성
    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      content,
      read: false
    });
    
    res.status(201).json({
      success: true,
      data: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt
      },
      message: '메시지가 전송되었습니다.'
    });
  } catch (error) {
    console.error('메시지 전송 오류:', error);
    res.status(500).json({
      success: false,
      error: '메시지 전송 중 오류가 발생했습니다.'
    });
  }
};

// 칭호 목록 조회
exports.getTitles = async (req, res) => {
  try {
    // 현재는 하드코딩된 칭호 목록을 반환
    // 추후 DB에서 조회하도록 변경 가능
    res.status(200).json({
      success: true,
      data: TITLES
    });
  } catch (error) {
    console.error('칭호 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '칭호 목록 조회 중 오류가 발생했습니다.'
    });
  }
};

// 칭호 설정
exports.setTitle = async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: '설정할 칭호가 필요합니다.'
      });
    }
    
    // 유효한 칭호인지 확인
    if (!TITLES.includes(title)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 칭호입니다.'
      });
    }
    
    // 칭호 업데이트
    await req.user.update({ title });
    
    res.status(200).json({
      success: true,
      message: '칭호가 성공적으로 변경되었습니다.'
    });
  } catch (error) {
    console.error('칭호 설정 오류:', error);
    res.status(500).json({
      success: false,
      error: '칭호 설정 중 오류가 발생했습니다.'
    });
  }
};

// 다른 사용자 프로필 조회 (관리자/모더레이터 전용)
exports.getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 사용자 조회
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 민감한 정보 제외한 사용자 데이터
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      image: user.image,
      contribution: user.contribution,
      createdAt: user.createdAt
    };
    
    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('사용자 프로필 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '사용자 프로필 조회 중 오류가 발생했습니다.'
    });
  }
}; 