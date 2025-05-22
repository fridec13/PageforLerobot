const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');

/**
 * 게시글 목록을 조회합니다.
 * @param {string} userId 현재 사용자 ID (선택적)
 * @param {Object} options 검색 옵션 (페이지네이션, 필터 등)
 * @returns {Promise<Object>} 게시글 목록과 페이지네이션 정보
 */
exports.getPosts = async (userId, options = {}) => {
  const { 
    page = 1, 
    limit = 20, 
    sort = 'recent',
    query,
    tags,
    topicId,
    groupId,
    userId: targetUserId
  } = options;
  const skip = (page - 1) * limit;
  
  // 검색 조건 구성
  const where = {};
  
  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { content: { contains: query, mode: 'insensitive' } }
    ];
  }
  
  if (tags && tags.length > 0) {
    where.tags = {
      some: {
        tag: {
          name: { in: tags }
        }
      }
    };
  }
  
  if (topicId) {
    where.topicId = parseInt(topicId);
  }
  
  if (groupId) {
    where.groupId = parseInt(groupId);
  }
  
  if (targetUserId) {
    where.authorId = targetUserId;
  }
  
  // 정렬 조건 설정
  let orderBy = {};
  switch (sort) {
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
  
  // 게시글 조회
  const [posts, totalCount] = await Promise.all([
    prisma.forumPost.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { isPinned: 'desc' },
        orderBy
      ],
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
        group: groupId ? {
          select: {
            id: true,
            name: true,
            slug: true
          }
        } : undefined,
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
    prisma.forumPost.count({ where })
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
    group: post.group,
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

/**
 * 주제별 게시글 목록을 조회합니다.
 * @param {string} userId 현재 사용자 ID (선택적)
 * @param {string} slug 주제 슬러그
 * @param {Object} options 페이지네이션 및 정렬 옵션
 * @returns {Promise<Object>} 게시글 목록과 페이지네이션 정보
 */
exports.getPostsByTopic = async (userId, slug, options = {}) => {
  // 주제 조회
  const topic = await prisma.topic.findUnique({
    where: { slug },
    select: { id: true }
  });
  
  if (!topic) {
    throw new NotFoundError('주제를 찾을 수 없습니다.');
  }
  
  // 해당 주제의 게시글 조회
  return exports.getPosts(userId, {
    ...options,
    topicId: topic.id
  });
};

/**
 * 특정 게시글의 상세 정보를 조회합니다.
 * @param {string} userId 현재 사용자 ID (선택적)
 * @param {number} id 게시글 ID
 * @returns {Promise<Object>} 게시글 상세 정보
 */
exports.getPostDetail = async (userId, id) => {
  // 게시글 조회
  const post = await prisma.forumPost.findUnique({
    where: { id },
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
      group: {
        select: {
          id: true,
          name: true,
          slug: true,
          isPrivate: true
        }
      },
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }
    }
  });
  
  if (!post) {
    throw new NotFoundError('게시글을 찾을 수 없습니다.');
  }
  
  // 비공개 그룹의 게시글인 경우 접근 권한 확인
  if (post.group && post.group.isPrivate) {
    if (!userId) {
      throw new ForbiddenError('비공개 그룹의 게시글에 접근할 권한이 없습니다.');
    }
    
    const isMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: post.groupId,
          userId
        }
      }
    });
    
    if (!isMember) {
      throw new ForbiddenError('비공개 그룹의 게시글에 접근할 권한이 없습니다.');
    }
  }
  
  // 결과 포맷팅
  const formattedPost = {
    id: post.id,
    title: post.title,
    content: post.content,
    topicId: post.topicId,
    topic: post.topic,
    author: {
      id: post.author.id,
      username: post.author.username || post.author.name,
      image: post.author.image
    },
    groupId: post.groupId,
    group: post.group,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    viewCount: post.viewCount,
    isPinned: post.isPinned,
    tags: post.tags.map(t => ({
      id: t.tag.id,
      name: t.tag.name,
      slug: t.tag.slug
    })),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  };
  
  // 사용자가 이 게시글을 좋아요했는지 확인
  if (userId) {
    const like = await prisma.forumPostLike.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId
        }
      }
    });
    
    formattedPost.isLiked = !!like;
  }
  
  // 조회수 증가 (트랜잭션 없이 비동기로 처리)
  prisma.forumPost.update({
    where: { id },
    data: { viewCount: { increment: 1 } }
  }).catch(err => console.error('조회수 증가 실패:', err));
  
  return formattedPost;
};

/**
 * 새 게시글을 생성합니다.
 * @param {string} userId 사용자 ID
 * @param {Object} postData 게시글 데이터
 * @returns {Promise<Object>} 생성된 게시글 정보
 */
exports.createPost = async (userId, postData) => {
  const { title, content, topicId, groupId, tags } = postData;
  
  // 필수 데이터 검증
  if (!title || !content || !topicId) {
    throw new ValidationError('제목, 내용, 주제는 필수 항목입니다.');
  }
  
  // 주제 존재 여부 확인
  const topic = await prisma.topic.findUnique({
    where: { id: topicId }
  });
  
  if (!topic) {
    throw new NotFoundError('존재하지 않는 주제입니다.');
  }
  
  // 그룹 접근 권한 확인
  if (groupId) {
    const group = await prisma.forumGroup.findUnique({
      where: { id: groupId }
    });
    
    if (!group) {
      throw new NotFoundError('존재하지 않는 그룹입니다.');
    }
    
    if (group.isPrivate) {
      const isMember = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId
          }
        }
      });
      
      if (!isMember) {
        throw new ForbiddenError('비공개 그룹에 게시글을 작성할 권한이 없습니다.');
      }
    }
  }
  
  // 게시글 생성 트랜잭션
  const result = await prisma.$transaction(async (tx) => {
    // 게시글 생성
    const post = await tx.forumPost.create({
      data: {
        title,
        content,
        topicId,
        authorId: userId,
        groupId
      },
      select: {
        id: true,
        title: true,
        content: true,
        topicId: true,
        authorId: true,
        groupId: true,
        createdAt: true
      }
    });
    
    // 태그 처리
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // 태그 찾거나 생성
        const tag = await tx.forumTag.upsert({
          where: { name: tagName },
          update: {},
          create: {
            name: tagName,
            slug: tagName.toLowerCase().replace(/\s+/g, '-')
          }
        });
        
        // 게시글-태그 연결
        await tx.forumPostTag.create({
          data: {
            postId: post.id,
            tagId: tag.id
          }
        });
      }
    }
    
    // 주제 게시글 수 증가
    await tx.topic.update({
      where: { id: topicId },
      data: { postCount: { increment: 1 } }
    });
    
    // 기여도 추가
    await tx.contribution.create({
      data: {
        userId,
        type: 'forum',
        contributionType: 'FORUM_POST',
        description: `포럼 게시글 작성: ${title}`,
        points: 5,
        targetId: post.id.toString(),
        targetUrl: `/forum/posts/${post.id}`
      }
    });
    
    return post;
  });
  
  return result;
};

/**
 * 게시글을 수정합니다.
 * @param {string} userId 사용자 ID
 * @param {number} id 게시글 ID
 * @param {Object} postData 수정할 게시글 데이터
 * @returns {Promise<Object>} 수정된 게시글 정보
 */
exports.updatePost = async (userId, id, postData) => {
  const { title, content, topicId, groupId, tags } = postData;
  
  // 게시글 존재 여부 확인
  const post = await prisma.forumPost.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true
        }
      }
    }
  });
  
  if (!post) {
    throw new NotFoundError('게시글을 찾을 수 없습니다.');
  }
  
  // 작성자 또는 관리자인지 확인
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  
  if (post.authorId !== userId && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
    throw new ForbiddenError('게시글을 수정할 권한이 없습니다.');
  }
  
  // 주제 변경 시 존재 여부 확인
  if (topicId && topicId !== post.topicId) {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId }
    });
    
    if (!topic) {
      throw new NotFoundError('존재하지 않는 주제입니다.');
    }
  }
  
  // 그룹 변경 시 접근 권한 확인
  if (groupId && groupId !== post.groupId) {
    const group = await prisma.forumGroup.findUnique({
      where: { id: groupId }
    });
    
    if (!group) {
      throw new NotFoundError('존재하지 않는 그룹입니다.');
    }
    
    if (group.isPrivate) {
      const isMember = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId
          }
        }
      });
      
      if (!isMember) {
        throw new ForbiddenError('비공개 그룹에 게시글을 작성할 권한이 없습니다.');
      }
    }
  }
  
  // 게시글 수정 트랜잭션
  const result = await prisma.$transaction(async (tx) => {
    // 주제 변경 시 게시글 수 조정
    if (topicId && topicId !== post.topicId) {
      await Promise.all([
        tx.topic.update({
          where: { id: post.topicId },
          data: { postCount: { decrement: 1 } }
        }),
        tx.topic.update({
          where: { id: topicId },
          data: { postCount: { increment: 1 } }
        })
      ]);
    }
    
    // 게시글 기본 정보 수정
    const updatedPost = await tx.forumPost.update({
      where: { id },
      data: {
        title: title || post.title,
        content: content || post.content,
        topicId: topicId || post.topicId,
        groupId: groupId === undefined ? post.groupId : groupId,
        updatedAt: new Date()
      },
      select: {
        id: true,
        title: true,
        content: true,
        topicId: true,
        authorId: true,
        groupId: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    // 태그 처리
    if (tags && tags.length > 0) {
      // 기존 태그 삭제
      await tx.forumPostTag.deleteMany({
        where: { postId: id }
      });
      
      // 새 태그 추가
      for (const tagName of tags) {
        const tag = await tx.forumTag.upsert({
          where: { name: tagName },
          update: {},
          create: {
            name: tagName,
            slug: tagName.toLowerCase().replace(/\s+/g, '-')
          }
        });
        
        await tx.forumPostTag.create({
          data: {
            postId: id,
            tagId: tag.id
          }
        });
      }
    }
    
    return updatedPost;
  });
  
  return result;
};

/**
 * 게시글을 삭제합니다.
 * @param {string} userId 사용자 ID
 * @param {number} id 게시글 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
exports.deletePost = async (userId, id) => {
  // 게시글 존재 여부 확인
  const post = await prisma.forumPost.findUnique({
    where: { id }
  });
  
  if (!post) {
    throw new NotFoundError('게시글을 찾을 수 없습니다.');
  }
  
  // 작성자 또는 관리자인지 확인
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  
  if (post.authorId !== userId && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
    throw new ForbiddenError('게시글을 삭제할 권한이 없습니다.');
  }
  
  // 게시글 삭제 트랜잭션
  await prisma.$transaction([
    // 주제의 게시글 수 감소
    prisma.topic.update({
      where: { id: post.topicId },
      data: { postCount: { decrement: 1 } }
    }),
    
    // 관련 기여도 기록 삭제
    prisma.contribution.deleteMany({
      where: {
        contributionType: 'FORUM_POST',
        targetId: id.toString()
      }
    }),
    
    // 게시글 태그 관계 삭제
    prisma.forumPostTag.deleteMany({
      where: { postId: id }
    }),
    
    // 게시글 좋아요 삭제
    prisma.forumPostLike.deleteMany({
      where: { postId: id }
    }),
    
    // 게시글 삭제 (댓글은 CASCADE로 자동 삭제됨)
    prisma.forumPost.delete({
      where: { id }
    })
  ]);
  
  return true;
};

/**
 * 게시글에 좋아요를 표시합니다.
 * @param {string} userId 사용자 ID
 * @param {number} id 게시글 ID
 * @returns {Promise<Object>} 결과 객체
 */
exports.likePost = async (userId, id) => {
  // 게시글 존재 여부 확인
  const post = await prisma.forumPost.findUnique({
    where: { id }
  });
  
  if (!post) {
    throw new NotFoundError('게시글을 찾을 수 없습니다.');
  }
  
  // 이미 좋아요한 경우
  const existingLike = await prisma.forumPostLike.findUnique({
    where: {
      postId_userId: {
        postId: id,
        userId
      }
    }
  });
  
  if (existingLike) {
    return { isLiked: true, message: '이미 좋아요한 게시글입니다.' };
  }
  
  // 좋아요 추가 트랜잭션
  await prisma.$transaction([
    // 좋아요 기록 추가
    prisma.forumPostLike.create({
      data: {
        postId: id,
        userId
      }
    }),
    
    // 게시글 좋아요 수 증가
    prisma.forumPost.update({
      where: { id },
      data: {
        likeCount: { increment: 1 }
      }
    })
  ]);
  
  return {
    isLiked: true,
    message: '게시글을 좋아요했습니다.'
  };
};

/**
 * 게시글 좋아요를 취소합니다.
 * @param {string} userId 사용자 ID
 * @param {number} id 게시글 ID
 * @returns {Promise<Object>} 결과 객체
 */
exports.unlikePost = async (userId, id) => {
  // 게시글 존재 여부 확인
  const post = await prisma.forumPost.findUnique({
    where: { id }
  });
  
  if (!post) {
    throw new NotFoundError('게시글을 찾을 수 없습니다.');
  }
  
  // 좋아요 기록 확인
  const existingLike = await prisma.forumPostLike.findUnique({
    where: {
      postId_userId: {
        postId: id,
        userId
      }
    }
  });
  
  if (!existingLike) {
    return { isLiked: false, message: '좋아요하지 않은 게시글입니다.' };
  }
  
  // 좋아요 취소 트랜잭션
  await prisma.$transaction([
    // 좋아요 기록 삭제
    prisma.forumPostLike.delete({
      where: {
        postId_userId: {
          postId: id,
          userId
        }
      }
    }),
    
    // 게시글 좋아요 수 감소
    prisma.forumPost.update({
      where: { id },
      data: {
        likeCount: { decrement: 1 }
      }
    })
  ]);
  
  return {
    isLiked: false,
    message: '게시글 좋아요를 취소했습니다.'
  };
}; 