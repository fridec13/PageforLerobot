const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 리더보드 모델 관련 함수들
 */
const LeaderboardModel = {
  /**
   * 기여도 순으로 사용자 목록 조회
   * @param {Object} options 조회 옵션
   * @param {string} options.period 기간 (all, month, week, day)
   * @param {number} options.page 페이지 번호
   * @param {number} options.limit 페이지당 항목 수
   * @returns {Promise<Object>} 기여자 목록과 페이지네이션 정보
   */
  async getContributors({ period = 'all', page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    
    // 기간별 날짜 필터 생성
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'day') {
      const dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { gte: dayStart } };
    } else if (period === 'week') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // 이번 주의 시작일 (일요일)
      weekStart.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { gte: weekStart } };
    } else if (period === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { createdAt: { gte: monthStart } };
    }
    
    // 기간에 따른 총 기여도 집계
    const userContributionsByPeriod = await prisma.contribution.groupBy({
      by: ['userId'],
      where: dateFilter,
      _sum: {
        points: true
      }
    });
    
    // 집계된 기여도로 기여자 ID 맵 생성
    const contributorMap = userContributionsByPeriod.reduce((acc, item) => {
      acc[item.userId] = item._sum.points;
      return acc;
    }, {});
    
    // 기여자 ID 리스트
    const contributorIds = Object.keys(contributorMap);
    
    // 총 기여자 수 계산
    const total = contributorIds.length;
    
    // 기여자 정보 조회 (기여도 높은 순)
    const users = await prisma.user.findMany({
      where: {
        id: { in: contributorIds }
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        contribution: true,  // 전체 기여도
        level: {
          select: {
            name: true,
            color: true,
            imageUrl: true
          }
        },
        userBadges: {
          select: {
            badge: {
              select: {
                name: true,
                image: true
              }
            }
          }
        }
      }
    });
    
    // 기여도로 정렬 및 페이지네이션 적용
    const sortedUsers = users
      .sort((a, b) => {
        // 기간별 기여도 우선 비교
        const periodPointsA = contributorMap[a.id] || 0;
        const periodPointsB = contributorMap[b.id] || 0;
        
        if (periodPointsB !== periodPointsA) {
          return periodPointsB - periodPointsA;
        }
        
        // 기간별 기여도가 같으면 전체 기여도로 비교
        return b.contribution - a.contribution;
      })
      .slice(skip, skip + limit);
    
    // 페이지네이션 정보 계산
    const totalPages = Math.ceil(total / limit) || 1;
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    // 응답 데이터 형식화
    const contributors = sortedUsers.map(user => ({
      id: user.id,
      name: user.name,
      username: user.username || user.name,
      avatar: user.image,
      contributions: period === 'all' ? user.contribution : (contributorMap[user.id] || 0),
      level: user.level?.name || 'Regular',
      levelColor: user.level?.color,
      badgeCount: user.userBadges?.length || 0,
      badges: user.userBadges?.map(ub => ({
        name: ub.badge.name,
        image: ub.badge.image
      }))
    }));
    
    return {
      contributors,
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
   * 특정 기여자의 상세 정보 조회
   * @param {string} userId 기여자 ID
   * @returns {Promise<Object|null>} 기여자 정보
   */
  async getContributorDetail(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        contribution: true,
        createdAt: true,
        level: {
          select: {
            name: true,
            description: true,
            color: true,
            imageUrl: true
          }
        },
        userBadges: {
          include: {
            badge: true
          }
        }
      }
    });
    
    if (!user) {
      return null;
    }
    
    // 최근 기여 활동 조회
    const recentContributions = await prisma.contribution.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    // 월별 기여 활동 집계
    const monthlyStats = await prisma.contribution.groupBy({
      by: ['userId'],
      where: { 
        userId,
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
        }
      },
      _sum: {
        points: true
      },
      _count: true
    });
    
    return {
      user: {
        id: user.id,
        name: user.name,
        username: user.username || user.name,
        avatar: user.image,
        totalContributions: user.contribution,
        level: user.level?.name || 'Regular',
        levelDescription: user.level?.description,
        levelColor: user.level?.color,
        levelImage: user.level?.imageUrl,
        memberSince: user.createdAt,
        badges: user.userBadges?.map(ub => ({
          id: ub.badge.id,
          name: ub.badge.name,
          description: ub.badge.description,
          image: ub.badge.image,
          awardedAt: ub.createdAt
        })) || []
      },
      recentActivities: recentContributions.map(c => ({
        id: c.id,
        type: c.type,
        description: c.description,
        points: c.points,
        date: c.createdAt
      })),
      stats: {
        monthly: monthlyStats.length ? {
          contributions: monthlyStats[0]._count,
          points: monthlyStats[0]._sum.points
        } : { contributions: 0, points: 0 }
      }
    };
  },
  
  /**
   * 활동이 가장 많은 기여자들 조회
   * @param {number} limit 조회할 기여자 수
   * @returns {Promise<Array>} 활발한 기여자 목록
   */
  async getMostActiveContributors(limit = 5) {
    // 최근 30일 이내 기여 활동이 많은 사용자 조회
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActiveUsers = await prisma.contribution.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      _count: true,
      _sum: {
        points: true
      }
    });
    
    // 활동이 많은 순으로 정렬
    const sortedActiveUsers = recentActiveUsers
      .sort((a, b) => b._sum.points - a._sum.points)
      .slice(0, limit);
    
    // 활발한 사용자 목록 조회
    const userIds = sortedActiveUsers.map(u => u.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        contribution: true,
        level: {
          select: {
            name: true,
            color: true
          }
        }
      }
    });
    
    // 사용자 ID로 맵 생성하여 빠른 조회
    const userMap = users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});
    
    // 응답 형식으로 변환
    return sortedActiveUsers.map(activeUser => ({
      id: activeUser.userId,
      name: userMap[activeUser.userId]?.name || 'Unknown User',
      username: userMap[activeUser.userId]?.username || userMap[activeUser.userId]?.name || 'unknown',
      avatar: userMap[activeUser.userId]?.image,
      recentContributions: activeUser._count,
      recentPoints: activeUser._sum.points,
      totalContributions: userMap[activeUser.userId]?.contribution || 0,
      level: userMap[activeUser.userId]?.level?.name || 'Regular',
      levelColor: userMap[activeUser.userId]?.level?.color
    }));
  },
  
  /**
   * 특정 카테고리의 기여자 조회
   * @param {string} category 카테고리 (wiki, docs, forum 등)
   * @param {number} limit 조회할 기여자 수
   * @returns {Promise<Array>} 카테고리별 기여자 목록
   */
  async getCategoryContributors(category, limit = 10) {
    // 카테고리로 필터링된 기여 활동 집계
    const categoryContributions = await prisma.contribution.groupBy({
      by: ['userId'],
      where: {
        type: { startsWith: category.toUpperCase() }
      },
      _sum: {
        points: true
      }
    });
    
    // 기여도 순으로 정렬
    const sortedContributors = categoryContributions
      .sort((a, b) => b._sum.points - a._sum.points)
      .slice(0, limit);
    
    // 기여자 정보 조회
    const userIds = sortedContributors.map(c => c.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
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
    });
    
    // 사용자 ID로 맵 생성
    const userMap = users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});
    
    // 응답 형식으로 변환
    return sortedContributors.map(contributor => ({
      id: contributor.userId,
      name: userMap[contributor.userId]?.name || 'Unknown User',
      username: userMap[contributor.userId]?.username || userMap[contributor.userId]?.name || 'unknown',
      avatar: userMap[contributor.userId]?.image,
      categoryPoints: contributor._sum.points,
      level: userMap[contributor.userId]?.level?.name || 'Regular',
      levelColor: userMap[contributor.userId]?.level?.color
    }));
  },
  
  /**
   * 레벨 목록 조회
   * @returns {Promise<Array>} 모든 레벨 정보
   */
  async getLevels() {
    const levels = await prisma.level.findMany({
      orderBy: { minPoints: 'asc' }
    });
    
    return levels;
  }
};

module.exports = LeaderboardModel; 