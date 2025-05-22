const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');

/**
 * 게시글의 댓글 목록을 조회합니다.
 * @param {string} userId 현재 사용자 ID (선택적)
 * @param {number} postId 게시글 ID
 * @param {Object} options 페이지네이션 옵션
 * @returns {Promise<Object>} 댓글 목록과 페이지네이션 정보
 */
exports.getComments = async (userId, postId, options = {}) => {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;
  
  // 게시글 존재 여부 확인
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    include: {
      group: {
        select: {
          isPrivate: true
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
      throw new ForbiddenError('비공개 그룹의 게시글 댓글에 접근할 권한이 없습니다.');
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
      throw new ForbiddenError('비공개 그룹의 게시글 댓글에 접근할 권한이 없습니다.');
    }
  }
  
  // 최상위 댓글과 총 개수 조회
  const [rootComments, totalCount] = await Promise.all([
    prisma.forumComment.findMany({
      where: { 
        postId,
        parentId: null
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        postId: true,
        authorId: true,
        parentId: true,
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
        }
      }
    }),
    prisma.forumComment.count({
      where: { 
        postId,
        parentId: null
      }
    })
  ]);
  
  // 대댓글 가져오기
  const commentIds = rootComments.map(c => c.id);
  const replies = await prisma.forumComment.findMany({
    where: {
      parentId: { in: commentIds }
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      content: true,
      postId: true,
      authorId: true,
      parentId: true,
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
      }
    }
  });
  
  // 대댓글을 부모 댓글에 매핑
  const repliesMap = {};
  replies.forEach(reply => {
    if (!repliesMap[reply.parentId]) {
      repliesMap[reply.parentId] = [];
    }
    repliesMap[reply.parentId].push(reply);
  });
  
  // 결과 포맷팅
  const formattedComments = rootComments.map(comment => {
    const formattedComment = {
      id: comment.id,
      content: comment.content,
      postId: comment.postId,
      author: {
        id: comment.author.id,
        username: comment.author.username || comment.author.name,
        image: comment.author.image
      },
      likeCount: comment.likeCount,
      parentId: comment.parentId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      replies: (repliesMap[comment.id] || []).map(reply => ({
        id: reply.id,
        content: reply.content,
        postId: reply.postId,
        author: {
          id: reply.author.id,
          username: reply.author.username || reply.author.name,
          image: reply.author.image
        },
        likeCount: reply.likeCount,
        parentId: reply.parentId,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt
      }))
    };
    
    return formattedComment;
  });
  
  // 사용자가 각 댓글을 좋아요했는지 확인
  if (userId) {
    // 모든 댓글 ID 수집
    const allCommentIds = [
      ...rootComments.map(c => c.id),
      ...replies.map(r => r.id)
    ];
    
    const userLikes = await prisma.forumCommentLike.findMany({
      where: {
        userId,
        commentId: { in: allCommentIds }
      },
      select: { commentId: true }
    });
    
    const likeMap = new Map(userLikes.map(like => [like.commentId, true]));
    
    // 루트 댓글에 좋아요 정보 추가
    formattedComments.forEach(comment => {
      comment.isLiked = likeMap.has(comment.id) || false;
      
      // 대댓글에 좋아요 정보 추가
      comment.replies.forEach(reply => {
        reply.isLiked = likeMap.has(reply.id) || false;
      });
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
 * 새 댓글을 생성합니다.
 * @param {string} userId 사용자 ID
 * @param {number} postId 게시글 ID
 * @param {string} content 댓글 내용
 * @param {number} parentId 부모 댓글 ID (대댓글인 경우)
 * @returns {Promise<Object>} 생성된 댓글 정보
 */
exports.createComment = async (userId, postId, content, parentId = null) => {
  // 내용 검증
  if (!content || content.trim() === '') {
    throw new ValidationError('댓글 내용은 필수입니다.');
  }
  
  // 게시글 존재 여부 확인
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    include: {
      group: {
        select: {
          isPrivate: true
        }
      }
    }
  });
  
  if (!post) {
    throw new NotFoundError('게시글을 찾을 수 없습니다.');
  }
  
  // 비공개 그룹의 게시글인 경우 접근 권한 확인
  if (post.group && post.group.isPrivate) {
    const isMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: post.groupId,
          userId
        }
      }
    });
    
    if (!isMember) {
      throw new ForbiddenError('비공개 그룹의 게시글에 댓글을 작성할 권한이 없습니다.');
    }
  }
  
  // 부모 댓글 존재 여부 확인 (대댓글인 경우)
  if (parentId) {
    const parentComment = await prisma.forumComment.findUnique({
      where: { id: parentId },
      select: { postId: true }
    });
    
    if (!parentComment) {
      throw new NotFoundError('부모 댓글을 찾을 수 없습니다.');
    }
    
    if (parentComment.postId !== postId) {
      throw new ValidationError('부모 댓글이 다른 게시글에 속해 있습니다.');
    }
  }
  
  // 댓글 생성 트랜잭션
  const result = await prisma.$transaction(async (tx) => {
    // 댓글 생성
    const comment = await tx.forumComment.create({
      data: {
        content,
        postId,
        authorId: userId,
        parentId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        }
      }
    });
    
    // 게시글 댓글 수 증가
    await tx.forumPost.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } }
    });
    
    // 기여도 추가
    await tx.contribution.create({
      data: {
        userId,
        type: 'forum',
        contributionType: 'FORUM_COMMENT',
        description: `포럼 댓글 작성`,
        points: 2,
        targetId: comment.id.toString(),
        targetUrl: `/forum/posts/${postId}#comment-${comment.id}`
      }
    });
    
    return comment;
  });
  
  return {
    id: result.id,
    content: result.content,
    postId: result.postId,
    author: {
      id: result.author.id,
      username: result.author.username || result.author.name,
      image: result.author.image
    },
    likeCount: result.likeCount,
    isLiked: false,
    parentId: result.parentId,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt
  };
};

/**
 * 댓글을 수정합니다.
 * @param {string} userId 사용자 ID
 * @param {number} postId 게시글 ID
 * @param {number} commentId 댓글 ID
 * @param {string} content 수정할 댓글 내용
 * @returns {Promise<Object>} 수정된 댓글 정보
 */
exports.updateComment = async (userId, postId, commentId, content) => {
  // 내용 검증
  if (!content || content.trim() === '') {
    throw new ValidationError('댓글 내용은 필수입니다.');
  }
  
  // 댓글 존재 여부 확인
  const comment = await prisma.forumComment.findUnique({
    where: { id: commentId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          role: true
        }
      }
    }
  });
  
  if (!comment) {
    throw new NotFoundError('댓글을 찾을 수 없습니다.');
  }
  
  if (comment.postId !== postId) {
    throw new ValidationError('댓글이 해당 게시글에 속해 있지 않습니다.');
  }
  
  // 작성자 또는 관리자인지 확인
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  
  if (comment.authorId !== userId && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
    throw new ForbiddenError('댓글을 수정할 권한이 없습니다.');
  }
  
  // 댓글 수정
  const updatedComment = await prisma.forumComment.update({
    where: { id: commentId },
    data: {
      content,
      updatedAt: new Date()
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true
        }
      }
    }
  });
  
  return {
    id: updatedComment.id,
    content: updatedComment.content,
    postId: updatedComment.postId,
    author: {
      id: updatedComment.author.id,
      username: updatedComment.author.username || updatedComment.author.name,
      image: updatedComment.author.image
    },
    likeCount: updatedComment.likeCount,
    parentId: updatedComment.parentId,
    createdAt: updatedComment.createdAt,
    updatedAt: updatedComment.updatedAt
  };
};

/**
 * 댓글을 삭제합니다.
 * @param {string} userId 사용자 ID
 * @param {number} postId 게시글 ID
 * @param {number} commentId 댓글 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
exports.deleteComment = async (userId, postId, commentId) => {
  // 댓글 존재 여부 확인
  const comment = await prisma.forumComment.findUnique({
    where: { id: commentId },
    include: {
      _count: {
        select: { replies: true }
      }
    }
  });
  
  if (!comment) {
    throw new NotFoundError('댓글을 찾을 수 없습니다.');
  }
  
  if (comment.postId !== postId) {
    throw new ValidationError('댓글이 해당 게시글에 속해 있지 않습니다.');
  }
  
  // 작성자 또는 관리자인지 확인
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  
  if (comment.authorId !== userId && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
    throw new ForbiddenError('댓글을 삭제할 권한이 없습니다.');
  }
  
  // 삭제할 댓글 수 계산 (대댓글 포함)
  const deleteCount = 1 + comment._count.replies;
  
  // 댓글 삭제 트랜잭션
  await prisma.$transaction([
    // 관련 기여도 기록 삭제
    prisma.contribution.deleteMany({
      where: {
        contributionType: 'FORUM_COMMENT',
        targetId: commentId.toString()
      }
    }),
    
    // 댓글 좋아요 삭제
    prisma.forumCommentLike.deleteMany({
      where: { commentId }
    }),
    
    // 댓글 삭제 (대댓글은 CASCADE로 자동 삭제됨)
    prisma.forumComment.delete({
      where: { id: commentId }
    }),
    
    // 게시글 댓글 수 감소
    prisma.forumPost.update({
      where: { id: postId },
      data: { commentCount: { decrement: deleteCount } }
    })
  ]);
  
  return true;
};

/**
 * 댓글에 좋아요를 표시합니다.
 * @param {string} userId 사용자 ID
 * @param {number} postId 게시글 ID
 * @param {number} commentId 댓글 ID
 * @returns {Promise<Object>} 결과 객체
 */
exports.likeComment = async (userId, postId, commentId) => {
  // 댓글 존재 여부 확인
  const comment = await prisma.forumComment.findUnique({
    where: { id: commentId }
  });
  
  if (!comment) {
    throw new NotFoundError('댓글을 찾을 수 없습니다.');
  }
  
  if (comment.postId !== postId) {
    throw new ValidationError('댓글이 해당 게시글에 속해 있지 않습니다.');
  }
  
  // 이미 좋아요한 경우
  const existingLike = await prisma.forumCommentLike.findUnique({
    where: {
      commentId_userId: {
        commentId,
        userId
      }
    }
  });
  
  if (existingLike) {
    return { isLiked: true, message: '이미 좋아요한 댓글입니다.' };
  }
  
  // 좋아요 추가 트랜잭션
  await prisma.$transaction([
    // 좋아요 기록 추가
    prisma.forumCommentLike.create({
      data: {
        commentId,
        userId
      }
    }),
    
    // 댓글 좋아요 수 증가
    prisma.forumComment.update({
      where: { id: commentId },
      data: {
        likeCount: { increment: 1 }
      }
    })
  ]);
  
  return {
    isLiked: true,
    message: '댓글을 좋아요했습니다.'
  };
};

/**
 * 댓글 좋아요를 취소합니다.
 * @param {string} userId 사용자 ID
 * @param {number} postId 게시글 ID
 * @param {number} commentId 댓글 ID
 * @returns {Promise<Object>} 결과 객체
 */
exports.unlikeComment = async (userId, postId, commentId) => {
  // 댓글 존재 여부 확인
  const comment = await prisma.forumComment.findUnique({
    where: { id: commentId }
  });
  
  if (!comment) {
    throw new NotFoundError('댓글을 찾을 수 없습니다.');
  }
  
  if (comment.postId !== postId) {
    throw new ValidationError('댓글이 해당 게시글에 속해 있지 않습니다.');
  }
  
  // 좋아요 기록 확인
  const existingLike = await prisma.forumCommentLike.findUnique({
    where: {
      commentId_userId: {
        commentId,
        userId
      }
    }
  });
  
  if (!existingLike) {
    return { isLiked: false, message: '좋아요하지 않은 댓글입니다.' };
  }
  
  // 좋아요 취소 트랜잭션
  await prisma.$transaction([
    // 좋아요 기록 삭제
    prisma.forumCommentLike.delete({
      where: {
        commentId_userId: {
          commentId,
          userId
        }
      }
    }),
    
    // 댓글 좋아요 수 감소
    prisma.forumComment.update({
      where: { id: commentId },
      data: {
        likeCount: { decrement: 1 }
      }
    })
  ]);
  
  return {
    isLiked: false,
    message: '댓글 좋아요를 취소했습니다.'
  };
}; 