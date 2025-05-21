const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { NotFoundError } = require('../utils/errors');

/**
 * 배지 목록을 조회합니다.
 * @param {Object} options 페이지네이션 옵션
 * @returns {Promise<Object>} 배지 목록과 페이지네이션 정보
 */
exports.getBadges = async (options = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  
  // 배지 목록 조회
  const [badges, totalCount] = await Promise.all([
    prisma.forumBadge.findMany({
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        criteria: true,
        categoryId: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    }),
    prisma.forumBadge.count()
  ]);
  
  // 결과 포맷팅
  const formattedBadges = badges.map(badge => ({
    id: badge.id,
    name: badge.name,
    description: badge.description,
    image: badge.image,
    criteria: badge.criteria,
    category: badge.category,
    usersCount: badge._count.users,
    createdAt: badge.createdAt
  }));
  
  return {
    badges: formattedBadges,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
};

/**
 * 특정 배지의 상세 정보를 조회합니다.
 * @param {number} id 배지 ID
 * @returns {Promise<Object>} 배지 상세 정보
 */
exports.getBadgeDetail = async (id) => {
  // 배지 정보 조회
  const badge = await prisma.forumBadge.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
      criteria: true,
      categoryId: true,
      createdAt: true,
      category: {
        select: {
          id: true,
          name: true,
          description: true
        }
      },
      _count: {
        select: {
          users: true
        }
      }
    }
  });
  
  if (!badge) {
    throw new NotFoundError('배지를 찾을 수 없습니다.');
  }
  
  // 최근에 획득한 사용자 5명 조회
  const recentUsers = await prisma.userForumBadge.findMany({
    where: { badgeId: id },
    orderBy: { awardedAt: 'desc' },
    take: 5,
    select: {
      awardedAt: true,
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
  
  // 배지 획득 통계 (월간)
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  
  const monthlyStats = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', "awardedAt") as month,
      COUNT(*) as count
    FROM "forum_user_badges"
    WHERE "badgeId" = ${id} AND "awardedAt" >= ${sixMonthsAgo}
    GROUP BY DATE_TRUNC('month', "awardedAt")
    ORDER BY month ASC
  `;
  
  // 결과 포맷팅
  return {
    id: badge.id,
    name: badge.name,
    description: badge.description,
    image: badge.image,
    criteria: badge.criteria,
    category: badge.category,
    usersCount: badge._count.users,
    createdAt: badge.createdAt,
    recentUsers: recentUsers.map(ub => ({
      user: {
        id: ub.user.id,
        username: ub.user.username || ub.user.name,
        image: ub.user.image
      },
      awardedAt: ub.awardedAt
    })),
    stats: {
      monthly: monthlyStats
    }
  };
};

/**
 * 특정 배지를 획득한 사용자 목록을 조회합니다.
 * @param {number} id 배지 ID
 * @param {Object} options 페이지네이션 옵션
 * @returns {Promise<Object>} 사용자 목록과 페이지네이션 정보
 */
exports.getBadgeUsers = async (id, options = {}) => {
  // 배지 존재 여부 확인
  const badge = await prisma.forumBadge.findUnique({
    where: { id },
    select: { id: true }
  });
  
  if (!badge) {
    throw new NotFoundError('배지를 찾을 수 없습니다.');
  }
  
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  
  // 배지를 획득한 사용자 목록 조회
  const [badgeUsers, totalCount] = await Promise.all([
    prisma.userForumBadge.findMany({
      where: { badgeId: id },
      skip,
      take: limit,
      orderBy: { awardedAt: 'desc' },
      select: {
        awardedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            title: true,
            contribution: true,
            _count: {
              select: {
                forumPosts: true,
                forumComments: true
              }
            }
          }
        }
      }
    }),
    prisma.userForumBadge.count({
      where: { badgeId: id }
    })
  ]);
  
  // 결과 포맷팅
  const formattedUsers = badgeUsers.map(bu => ({
    user: {
      id: bu.user.id,
      username: bu.user.username || bu.user.name,
      image: bu.user.image,
      bio: bu.user.title,
      contribution: bu.user.contribution,
      postCount: bu.user._count.forumPosts,
      commentCount: bu.user._count.forumComments
    },
    awardedAt: bu.awardedAt
  }));
  
  return {
    users: formattedUsers,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
};

/**
 * 배지 카테고리 목록을 조회합니다.
 * @returns {Promise<Array>} 배지 카테고리 목록
 */
exports.getBadgeCategories = async () => {
  const categories = await prisma.forumBadgeCategory.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      _count: {
        select: {
          badges: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });
  
  return categories.map(category => ({
    id: category.id,
    name: category.name,
    description: category.description,
    badgeCount: category._count.badges
  }));
};

/**
 * 새 배지를 생성합니다. (관리자 전용)
 * @param {Object} data 배지 데이터
 * @returns {Promise<Object>} 생성된 배지 정보
 */
exports.createBadge = async (data) => {
  const { name, description, image, criteria, categoryId } = data;
  
  // 카테고리 존재 여부 확인
  if (categoryId) {
    const category = await prisma.forumBadgeCategory.findUnique({
      where: { id: categoryId }
    });
    
    if (!category) {
      throw new NotFoundError('존재하지 않는 배지 카테고리입니다.');
    }
  }
  
  // 배지 생성
  const badge = await prisma.forumBadge.create({
    data: {
      name,
      description,
      image,
      criteria,
      categoryId
    }
  });
  
  return badge;
};

/**
 * 배지를 사용자에게 부여합니다. (관리자 전용)
 * @param {number} badgeId 배지 ID
 * @param {string} userId 사용자 ID
 * @returns {Promise<Object>} 결과 객체
 */
exports.awardBadgeToUser = async (badgeId, userId) => {
  // 배지 존재 여부 확인
  const badge = await prisma.forumBadge.findUnique({
    where: { id: badgeId },
    select: { id: true, name: true }
  });
  
  if (!badge) {
    throw new NotFoundError('배지를 찾을 수 없습니다.');
  }
  
  // 사용자 존재 여부 확인
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true }
  });
  
  if (!user) {
    throw new NotFoundError('사용자를 찾을 수 없습니다.');
  }
  
  // 이미 배지가 부여되어 있는지 확인
  const existingAward = await prisma.userForumBadge.findUnique({
    where: {
      userId_badgeId: {
        userId,
        badgeId
      }
    }
  });
  
  if (existingAward) {
    return { 
      success: false, 
      message: '이미 해당 배지가 부여되어 있습니다.' 
    };
  }
  
  // 배지 부여
  await prisma.userForumBadge.create({
    data: {
      userId,
      badgeId
    }
  });
  
  // 기여도 추가
  await prisma.contribution.create({
    data: {
      userId,
      type: 'badge',
      contributionType: 'OTHER',
      description: `배지 획득: ${badge.name}`,
      points: 10,
      targetId: badge.id.toString()
    }
  });
  
  return { 
    success: true, 
    message: '배지가 성공적으로 부여되었습니다.' 
  };
}; 