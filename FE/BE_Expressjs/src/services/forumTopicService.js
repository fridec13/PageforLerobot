const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { NotFoundError, ForbiddenError } = require('../utils/errors');

/**
 * 주제 목록을 조회합니다.
 * @param {string} userId 현재 사용자 ID (선택적)
 * @param {Object} options 페이지네이션 및 정렬 옵션
 * @returns {Promise<Object>} 주제 목록과 페이지네이션 정보
 */
exports.getTopics = async (userId, options = {}) => {
  const { page = 1, limit = 20, sort = 'popular' } = options;
  const skip = (page - 1) * limit;
  
  // 정렬 조건 설정
  let orderBy = {};
  switch (sort) {
    case 'popular':
      orderBy = { followersCount: 'desc' };
      break;
    case 'postCount':
      orderBy = { postCount: 'desc' };
      break;
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    default:
      orderBy = { followersCount: 'desc' };
  }
  
  // 주제 목록 조회
  const [topics, totalCount] = await Promise.all([
    prisma.topic.findMany({
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        title: true,
        description: true,
        slug: true,
        postCount: true,
        followersCount: true,
        createdAt: true,
        updatedAt: true
      }
    }),
    prisma.topic.count()
  ]);
  
  // 사용자 인증이 있을 경우 사용자가 팔로우한 주제인지 확인
  if (userId) {
    const userFollowings = await prisma.topicFollower.findMany({
      where: { 
        userId,
        topicId: { in: topics.map(topic => topic.id) }
      },
      select: { topicId: true }
    });
    
    const followingMap = new Map(userFollowings.map(f => [f.topicId, true]));
    
    topics.forEach(topic => {
      topic.isFollowing = followingMap.has(topic.id) || false;
    });
  }
  
  return {
    topics,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
};

/**
 * 특정 주제의 상세 정보를 조회합니다.
 * @param {string} userId 현재 사용자 ID (선택적)
 * @param {string} slug 주제 슬러그
 * @returns {Promise<Object>} 주제 상세 정보
 */
exports.getTopicDetail = async (userId, slug) => {
  const topic = await prisma.topic.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      description: true,
      slug: true,
      postCount: true,
      followersCount: true,
      createdAt: true,
      updatedAt: true
    }
  });
  
  if (!topic) {
    throw new NotFoundError('주제를 찾을 수 없습니다.');
  }
  
  // 사용자가 이 주제를 팔로우했는지 확인
  if (userId) {
    const following = await prisma.topicFollower.findUnique({
      where: {
        topicId_userId: {
          topicId: topic.id,
          userId
        }
      }
    });
    
    topic.isFollowing = !!following;
  }
  
  return topic;
};

/**
 * 주제를 팔로우합니다.
 * @param {string} userId 사용자 ID
 * @param {number} topicId 주제 ID
 * @returns {Promise<Object>} 결과 객체
 */
exports.followTopic = async (userId, topicId) => {
  // 주제 존재 여부 확인
  const topic = await prisma.topic.findUnique({
    where: { id: topicId }
  });
  
  if (!topic) {
    throw new NotFoundError('주제를 찾을 수 없습니다.');
  }
  
  // 이미 팔로우한 경우
  const existingFollow = await prisma.topicFollower.findUnique({
    where: {
      topicId_userId: {
        topicId,
        userId
      }
    }
  });
  
  if (existingFollow) {
    return { isFollowing: true, message: '이미 팔로우 중인 주제입니다.' };
  }
  
  // 트랜잭션 처리
  const result = await prisma.$transaction([
    // 팔로우 기록 추가
    prisma.topicFollower.create({
      data: {
        topicId,
        userId
      }
    }),
    
    // 주제의 팔로워 수 증가
    prisma.topic.update({
      where: { id: topicId },
      data: {
        followersCount: { increment: 1 }
      }
    })
  ]);
  
  return {
    isFollowing: true,
    message: '주제를 팔로우했습니다.'
  };
};

/**
 * 주제 팔로우를 취소합니다.
 * @param {string} userId 사용자 ID
 * @param {number} topicId 주제 ID
 * @returns {Promise<Object>} 결과 객체
 */
exports.unfollowTopic = async (userId, topicId) => {
  // 주제 존재 여부 확인
  const topic = await prisma.topic.findUnique({
    where: { id: topicId }
  });
  
  if (!topic) {
    throw new NotFoundError('주제를 찾을 수 없습니다.');
  }
  
  // 팔로우 기록 확인
  const existingFollow = await prisma.topicFollower.findUnique({
    where: {
      topicId_userId: {
        topicId,
        userId
      }
    }
  });
  
  if (!existingFollow) {
    return { isFollowing: false, message: '팔로우하지 않은 주제입니다.' };
  }
  
  // 트랜잭션 처리
  const result = await prisma.$transaction([
    // 팔로우 기록 삭제
    prisma.topicFollower.delete({
      where: {
        topicId_userId: {
          topicId,
          userId
        }
      }
    }),
    
    // 주제의 팔로워 수 감소
    prisma.topic.update({
      where: { id: topicId },
      data: {
        followersCount: { decrement: 1 }
      }
    })
  ]);
  
  return {
    isFollowing: false,
    message: '주제 팔로우를 취소했습니다.'
  };
};

/**
 * 포럼 전체 검색을 수행합니다.
 * @param {string} userId 현재 사용자 ID (선택적)
 * @param {string} query 검색어
 * @param {Object} options 검색 옵션 (페이지네이션, 필터 등)
 * @returns {Promise<Object>} 검색 결과 및 페이지네이션 정보
 */
exports.searchForum = async (userId, query, options = {}) => {
  const { 
    page = 1, 
    limit = 20, 
    sort = 'relevance',
    tags,
    topicId,
    groupId,
    userId: targetUserId
  } = options;
  const skip = (page - 1) * limit;
  
  // 검색 조건 구성
  const searchCondition = {
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { content: { contains: query, mode: 'insensitive' } }
    ]
  };
  
  // 추가 필터 적용
  if (tags && tags.length > 0) {
    searchCondition.tags = {
      some: {
        tag: {
          name: { in: tags }
        }
      }
    };
  }
  
  if (topicId) {
    searchCondition.topicId = topicId;
  }
  
  if (groupId) {
    searchCondition.groupId = groupId;
  }
  
  if (targetUserId) {
    searchCondition.authorId = targetUserId;
  }
  
  // 정렬 조건 설정
  let orderBy = {};
  switch (sort) {
    case 'relevance': // 기본은 최신순으로
      orderBy = { createdAt: 'desc' };
      break;
    case 'recent':
      orderBy = { createdAt: 'desc' };
      break;
    case 'popular':
      orderBy = { likeCount: 'desc' };
      break;
    case 'comments':
      orderBy = { commentCount: 'desc' };
      break;
    case 'views':
      orderBy = { viewCount: 'desc' };
      break;
    default:
      orderBy = { createdAt: 'desc' };
  }
  
  // 게시글 검색
  const [posts, totalCount] = await Promise.all([
    prisma.forumPost.findMany({
      where: searchCondition,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        title: true,
        content: true,
        topicId: true,
        authorId: true,
        groupId: true,
        likeCount: true,
        commentCount: true,
        viewCount: true,
        isPinned: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        },
        topic: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        tags: {
          select: {
            tag: {
              select: {
                name: true
              }
            }
          }
        }
      }
    }),
    prisma.forumPost.count({ where: searchCondition })
  ]);
  
  // 결과 포맷팅
  const formattedPosts = posts.map(post => ({
    id: post.id,
    title: post.title,
    content: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : ''), // 미리보기용 내용
    topicId: post.topicId,
    topic: post.topic,
    author: {
      id: post.author.id,
      username: post.author.username || post.author.name,
      image: post.author.image
    },
    groupId: post.groupId,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    viewCount: post.viewCount,
    isPinned: post.isPinned,
    tags: post.tags.map(t => t.tag.name),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  }));
  
  // 사용자가 각 게시글을 좋아요했는지 확인
  if (userId) {
    const userLikes = await prisma.forumPostLike.findMany({
      where: { 
        userId,
        postId: { in: posts.map(post => post.id) }
      },
      select: { postId: true }
    });
    
    const likeMap = new Map(userLikes.map(like => [like.postId, true]));
    
    formattedPosts.forEach(post => {
      post.isLiked = likeMap.has(post.id) || false;
    });
  }
  
  return {
    posts: formattedPosts,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
}; 