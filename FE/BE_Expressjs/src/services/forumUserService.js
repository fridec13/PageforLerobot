const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { NotFoundError, ForbiddenError } = require('../utils/errors');

/**
 * 활동적인 사용자 목록을 조회합니다.
 * @param {string} currentUserId 현재 사용자 ID (선택적)
 * @param {Object} options 페이지네이션 및 정렬 옵션
 * @returns {Promise<Object>} 사용자 목록과 페이지네이션 정보
 */
exports.getUsers = async (currentUserId, options = {}) => {
  const { page = 1, limit = 20, sort = 'popular' } = options;
  const skip = (page - 1) * limit;
  
  // 정렬 조건 설정
  let orderBy = {};
  switch (sort) {
    case 'popular':
      orderBy = [
        { contribution: 'desc' },
        { forumPosts: { _count: 'desc' } }
      ];
      break;
    case 'recent':
      orderBy = { lastLoginAt: 'desc' };
      break;
    case 'posts':
      orderBy = { forumPosts: { _count: 'desc' } };
      break;
    case 'comments':
      orderBy = { forumComments: { _count: 'desc' } };
      break;
    default:
      orderBy = { contribution: 'desc' };
  }
  
  // 사용자 목록 조회
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        title: true,
        contribution: true,
        createdAt: true,
        _count: {
          select: {
            forumPosts: true,
            forumComments: true,
            followers: true,
            following: true
          }
        },
        userBadges: {
          select: {
            badge: {
              select: {
                id: true,
                name: true,
                description: true,
                image: true
              }
            }
          },
          take: 3, // 대표 배지 3개만 표시
        }
      },
      where: {
        // 사용자 이름이 있는 경우만 표시
        username: {
          not: null
        }
      }
    }),
    prisma.user.count({
      where: {
        username: {
          not: null
        }
      }
    })
  ]);
  
  // 결과 포맷팅
  const formattedUsers = users.map(user => ({
    id: user.id,
    username: user.username || user.name,
    image: user.image,
    bio: user.title,
    postCount: user._count.forumPosts,
    commentCount: user._count.forumComments,
    followersCount: user._count.followers,
    followingCount: user._count.following,
    joinedAt: user.createdAt,
    badges: user.userBadges.map(ub => ({
      id: ub.badge.id,
      name: ub.badge.name,
      description: ub.badge.description,
      image: ub.badge.image
    }))
  }));
  
  // 로그인한 사용자가 각 사용자를 팔로우했는지 확인
  if (currentUserId) {
    const userFollowings = await prisma.userFollower.findMany({
      where: {
        followerId: currentUserId,
        followingId: {
          in: users.map(user => user.id)
        }
      },
      select: {
        followingId: true
      }
    });
    
    const followingMap = new Map(userFollowings.map(f => [f.followingId, true]));
    
    formattedUsers.forEach(user => {
      user.isFollowing = followingMap.has(user.id) || false;
    });
  }
  
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
 * 특정 사용자의 상세 정보를 조회합니다.
 * @param {string} currentUserId 현재 사용자 ID (선택적)
 * @param {string} username 조회할 사용자 이름
 * @returns {Promise<Object>} 사용자 상세 정보
 */
exports.getUserDetail = async (currentUserId, username) => {
  // 사용자 조회
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      title: true,
      contribution: true,
      createdAt: true,
      _count: {
        select: {
          forumPosts: true,
          forumComments: true,
          followers: true,
          following: true
        }
      },
      userBadges: {
        select: {
          badge: {
            select: {
              id: true,
              name: true,
              description: true,
              image: true
            }
          },
          createdAt: true
        }
      }
    }
  });
  
  if (!user) {
    throw new NotFoundError('사용자를 찾을 수 없습니다.');
  }
  
  // 최근 활동 조회
  const recentActivity = await prisma.contribution.findMany({
    where: {
      userId: user.id,
      OR: [
        { contributionType: 'FORUM_POST' },
        { contributionType: 'FORUM_COMMENT' }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      description: true,
      points: true,
      createdAt: true,
      targetUrl: true,
      contributionType: true
    }
  });
  
  // 결과 포맷팅
  const formattedUser = {
    id: user.id,
    username: user.username,
    image: user.image,
    bio: user.title,
    postCount: user._count.forumPosts,
    commentCount: user._count.forumComments,
    followersCount: user._count.followers,
    followingCount: user._count.following,
    joinedAt: user.createdAt,
    badges: user.userBadges.map(ub => ({
      id: ub.badge.id,
      name: ub.badge.name,
      description: ub.badge.description,
      image: ub.badge.image,
      awardedAt: ub.createdAt
    })),
    recentActivity
  };
  
  // 현재 사용자가 이 사용자를 팔로우했는지 확인
  if (currentUserId) {
    const isFollowing = await prisma.userFollower.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: user.id
        }
      }
    });
    
    formattedUser.isFollowing = !!isFollowing;
  }
  
  return formattedUser;
};

/**
 * 특정 사용자가 작성한 게시글 목록을 조회합니다.
 * @param {string} currentUserId 현재 사용자 ID (선택적)
 * @param {string} username 사용자 이름
 * @param {Object} options 페이지네이션 옵션
 * @returns {Promise<Object>} 게시글 목록과 페이지네이션 정보
 */
exports.getUserPosts = async (currentUserId, username, options = {}) => {
  // 사용자 조회
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true }
  });
  
  if (!user) {
    throw new NotFoundError('사용자를 찾을 수 없습니다.');
  }
  
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  
  // 게시글 목록 조회
  const [posts, totalCount] = await Promise.all([
    prisma.forumPost.findMany({
      where: { authorId: user.id },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
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
              select: { name: true }
            }
          }
        }
      }
    }),
    prisma.forumPost.count({
      where: { authorId: user.id }
    })
  ]);
  
  // 결과 포맷팅
  const formattedPosts = posts.map(post => ({
    id: post.id,
    title: post.title,
    content: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : ''),
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
    tags: post.tags.map(t => t.tag.name),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  }));
  
  // 로그인한 사용자가 각 게시글을 좋아요했는지 확인
  if (currentUserId) {
    const userLikes = await prisma.forumPostLike.findMany({
      where: { 
        userId: currentUserId,
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

/**
 * 특정 사용자가 작성한 댓글 목록을 조회합니다.
 * @param {string} currentUserId 현재 사용자 ID (선택적)
 * @param {string} username 사용자 이름
 * @param {Object} options 페이지네이션 옵션
 * @returns {Promise<Object>} 댓글 목록과 페이지네이션 정보
 */
exports.getUserComments = async (currentUserId, username, options = {}) => {
  // 사용자 조회
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true }
  });
  
  if (!user) {
    throw new NotFoundError('사용자를 찾을 수 없습니다.');
  }
  
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  
  // 댓글 목록 조회
  const [comments, totalCount] = await Promise.all([
    prisma.forumComment.findMany({
      where: { authorId: user.id },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        postId: true,
        authorId: true,
        likeCount: true,
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
        post: {
          select: {
            id: true,
            title: true
          }
        }
      }
    }),
    prisma.forumComment.count({
      where: { authorId: user.id }
    })
  ]);
  
  // 결과 포맷팅
  const formattedComments = comments.map(comment => ({
    id: comment.id,
    content: comment.content,
    postId: comment.postId,
    post: comment.post,
    author: {
      id: comment.author.id,
      username: comment.author.username || comment.author.name,
      image: comment.author.image
    },
    likeCount: comment.likeCount,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt
  }));
  
  // 로그인한 사용자가 각 댓글을 좋아요했는지 확인
  if (currentUserId) {
    const userLikes = await prisma.forumCommentLike.findMany({
      where: { 
        userId: currentUserId,
        commentId: { in: comments.map(comment => comment.id) }
      },
      select: { commentId: true }
    });
    
    const likeMap = new Map(userLikes.map(like => [like.commentId, true]));
    
    formattedComments.forEach(comment => {
      comment.isLiked = likeMap.has(comment.id) || false;
    });
  }
  
  return {
    comments: formattedComments,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
};

/**
 * 특정 사용자를 팔로우합니다.
 * @param {string} followerId 팔로우하는 사용자 ID
 * @param {string} username 팔로우할 사용자 이름
 * @returns {Promise<Object>} 결과 객체
 */
exports.followUser = async (followerId, username) => {
  // 대상 사용자 조회
  const targetUser = await prisma.user.findUnique({
    where: { username },
    select: { id: true }
  });
  
  if (!targetUser) {
    throw new NotFoundError('사용자를 찾을 수 없습니다.');
  }
  
  // 자기 자신을 팔로우하는 경우
  if (followerId === targetUser.id) {
    throw new ForbiddenError('자기 자신을 팔로우할 수 없습니다.');
  }
  
  // 이미 팔로우한 경우
  const existingFollow = await prisma.userFollower.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId: targetUser.id
      }
    }
  });
  
  if (existingFollow) {
    return { isFollowing: true, message: '이미 팔로우 중인 사용자입니다.' };
  }
  
  // 팔로우 트랜잭션
  await prisma.userFollower.create({
    data: {
      followerId,
      followingId: targetUser.id
    }
  });
  
  return {
    isFollowing: true,
    message: '사용자를 팔로우했습니다.'
  };
};

/**
 * 특정 사용자 팔로우를 취소합니다.
 * @param {string} followerId 팔로우 취소하는 사용자 ID
 * @param {string} username 팔로우 취소할 사용자 이름
 * @returns {Promise<Object>} 결과 객체
 */
exports.unfollowUser = async (followerId, username) => {
  // 대상 사용자 조회
  const targetUser = await prisma.user.findUnique({
    where: { username },
    select: { id: true }
  });
  
  if (!targetUser) {
    throw new NotFoundError('사용자를 찾을 수 없습니다.');
  }
  
  // 팔로우 기록 확인
  const existingFollow = await prisma.userFollower.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId: targetUser.id
      }
    }
  });
  
  if (!existingFollow) {
    return { isFollowing: false, message: '팔로우하지 않은 사용자입니다.' };
  }
  
  // 팔로우 취소
  await prisma.userFollower.delete({
    where: {
      followerId_followingId: {
        followerId,
        followingId: targetUser.id
      }
    }
  });
  
  return {
    isFollowing: false,
    message: '사용자 팔로우를 취소했습니다.'
  };
}; 