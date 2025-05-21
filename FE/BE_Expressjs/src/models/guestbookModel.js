const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 방명록 모델 관련 함수들
 */
const GuestbookModel = {
  /**
   * 모든 방명록 항목 조회
   * @param {Object} options 페이지네이션 옵션
   * @param {number} options.page 페이지 번호
   * @param {number} options.limit 페이지당 항목 수
   * @param {boolean} options.includeUnapproved 승인되지 않은 항목 포함 여부 (관리자용)
   * @returns {Promise<Object>} 방명록 항목과 페이지네이션 정보
   */
  async findAll({ page = 1, limit = 10, includeUnapproved = false }) {
    const skip = (page - 1) * limit;
    
    // 기본 필터: 승인된 항목만
    const where = includeUnapproved ? {} : { isApproved: true };
    
    // 총 항목 수 계산
    const total = await prisma.guestbook.count({ where });
    
    // 방명록 조회
    const entries = await prisma.guestbook.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            level: {
              select: {
                name: true,
                color: true
              }
            }
          }
        }
      }
    });
    
    // 페이지네이션 정보 계산
    const totalPages = Math.ceil(total / limit) || 1;
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    return {
      entries: entries.map(entry => ({
        id: entry.id,
        content: entry.content,
        date: entry.createdAt,
        name: entry.user?.name || '익명',
        userId: entry.userId,
        userImage: entry.user?.image,
        userLevel: entry.user?.level?.name,
        levelColor: entry.user?.level?.color
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    };
  },
  
  /**
   * 특정 ID의 방명록 항목 조회
   * @param {string} id 방명록 항목 ID
   * @returns {Promise<Object|null>} 방명록 항목
   */
  async findById(id) {
    return prisma.guestbook.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        }
      }
    });
  },
  
  /**
   * 새 방명록 항목 생성
   * @param {Object} data 방명록 데이터
   * @param {string} data.content 방명록 내용
   * @param {string|null} data.userId 작성자 ID (익명인 경우 null)
   * @returns {Promise<Object>} 생성된 방명록 항목
   */
  async create({ content, userId }) {
    return prisma.guestbook.create({
      data: {
        content,
        userId,
        // 기본값으로 isApproved가 true로 설정됨
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      }
    });
  },
  
  /**
   * 방명록 항목 삭제
   * @param {string} id 방명록 항목 ID
   * @returns {Promise<Object>} 삭제된 방명록 항목
   */
  async delete(id) {
    return prisma.guestbook.delete({
      where: { id }
    });
  },
  
  /**
   * 관리자용 방명록 승인 상태 변경
   * @param {string} id 방명록 항목 ID
   * @param {boolean} isApproved 승인 상태
   * @returns {Promise<Object>} 업데이트된 방명록 항목
   */
  async updateApprovalStatus(id, isApproved) {
    return prisma.guestbook.update({
      where: { id },
      data: { isApproved }
    });
  }
};

module.exports = GuestbookModel; 