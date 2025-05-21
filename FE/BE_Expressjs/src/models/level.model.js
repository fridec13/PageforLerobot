const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 레벨 모델 관련 함수들
 */
const LevelModel = {
  /**
   * 모든 레벨 목록 조회
   * @returns {Promise<Array>} 레벨 목록
   */
  async findAll() {
    return prisma.level.findMany({
      orderBy: { minPoints: 'asc' }
    });
  },

  /**
   * 특정 레벨 조회
   * @param {string} id 레벨 ID
   * @returns {Promise<Object|null>} 레벨 정보
   */
  async findById(id) {
    return prisma.level.findUnique({
      where: { id }
    });
  },
  
  /**
   * 레벨 이름으로 조회
   * @param {string} name 레벨 이름
   * @returns {Promise<Object|null>} 레벨 정보
   */
  async findByName(name) {
    return prisma.level.findUnique({
      where: { name }
    });
  },
  
  /**
   * 포인트에 해당하는 레벨 조회
   * @param {number} points 기여 포인트
   * @returns {Promise<Object|null>} 레벨 정보
   */
  async findLevelByPoints(points) {
    // 포인트가 충분한 레벨 중 가장 높은 레벨 선택
    const levels = await prisma.level.findMany({
      where: {
        minPoints: { lte: points }
      },
      orderBy: {
        minPoints: 'desc'
      },
      take: 1
    });
    
    return levels.length > 0 ? levels[0] : null;
  },
  
  /**
   * 새 레벨 생성
   * @param {Object} data 레벨 데이터
   * @returns {Promise<Object>} 생성된 레벨
   */
  async create(data) {
    return prisma.level.create({
      data: {
        name: data.name,
        description: data.description,
        minPoints: data.minPoints,
        maxPoints: data.maxPoints,
        imageUrl: data.imageUrl,
        color: data.color
      }
    });
  },
  
  /**
   * 레벨 정보 업데이트
   * @param {string} id 레벨 ID
   * @param {Object} data 업데이트할 데이터
   * @returns {Promise<Object>} 업데이트된 레벨
   */
  async update(id, data) {
    return prisma.level.update({
      where: { id },
      data
    });
  },
  
  /**
   * 레벨 삭제
   * @param {string} id 레벨 ID
   * @returns {Promise<Object>} 삭제된 레벨
   */
  async delete(id) {
    return prisma.level.delete({
      where: { id }
    });
  },
  
  /**
   * 사용자의 레벨 업데이트
   * @param {string} userId 사용자 ID
   * @returns {Promise<Object>} 업데이트된 사용자 정보
   */
  async updateUserLevel(userId) {
    // 사용자의 현재 기여도 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { contribution: true }
    });
    
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    
    // 기여도에 해당하는 레벨 조회
    const level = await this.findLevelByPoints(user.contribution);
    
    if (!level) {
      // 해당하는 레벨이 없으면 업데이트 안함
      return null;
    }
    
    // 사용자 레벨 업데이트
    return prisma.user.update({
      where: { id: userId },
      data: { levelId: level.id },
      include: {
        level: true
      }
    });
  },
  
  /**
   * 모든 사용자의 레벨 재계산
   * @returns {Promise<number>} 업데이트된 사용자 수
   */
  async recalculateAllUserLevels() {
    // 모든 사용자 조회
    const users = await prisma.user.findMany({
      select: { id: true, contribution: true }
    });
    
    let updatedCount = 0;
    
    // 각 사용자에 대해 레벨 업데이트
    for (const user of users) {
      try {
        await this.updateUserLevel(user.id);
        updatedCount++;
      } catch (err) {
        console.error(`사용자 ${user.id} 레벨 업데이트 오류:`, err);
      }
    }
    
    return updatedCount;
  },
  
  /**
   * 기본 레벨 생성 (설정된 레벨이 없는 경우 사용)
   * @returns {Promise<Array>} 생성된 레벨 목록
   */
  async seedDefaultLevels() {
    const defaultLevels = [
      {
        name: 'Regular',
        description: '활동을 시작한 회원',
        minPoints: 0,
        maxPoints: 29,
        color: '#808080' // 회색
      },
      {
        name: 'Advanced',
        description: '꾸준히 활동하는 회원',
        minPoints: 30,
        maxPoints: 59,
        color: '#3CB371' // 중간 해초색
      },
      {
        name: 'Master',
        description: '지식을 나누는 능력자',
        minPoints: 60,
        maxPoints: 99,
        color: '#1E90FF' // 밝은 파란색
      },
      {
        name: 'Expert',
        description: '탁월한 기여를 하는 전문가',
        minPoints: 100,
        maxPoints: 149,
        color: '#9370DB' // 중간 보라색
      },
      {
        name: 'Researcher',
        description: '새로운 지식을 창출하는 연구자',
        minPoints: 150,
        maxPoints: 199,
        color: '#FFD700' // 금색
      },
      {
        name: 'Sapiens',
        description: '지혜를 나누는 최고 등급',
        minPoints: 200,
        maxPoints: null,
        color: '#FF4500' // 붉은 주황색
      }
    ];
    
    // 이미 레벨이 있는지 확인
    const existingLevels = await prisma.level.findMany();
    
    if (existingLevels.length > 0) {
      return existingLevels;
    }
    
    // 레벨이 없으면 기본 레벨 생성
    const createdLevels = [];
    
    for (const level of defaultLevels) {
      const created = await prisma.level.create({
        data: level
      });
      createdLevels.push(created);
    }
    
    return createdLevels;
  }
};

module.exports = LevelModel; 