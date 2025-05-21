const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CommunityService {
  /**
   * 게시글 목록 조회
   */
  async getPosts({ page = 1, limit = 10, sort = 'latest', category, search }) {
    const skip = (page - 1) * limit;
    
    let orderBy = {};
    switch (sort) {
      case 'popular':
        orderBy = { likeCount: 'desc' };
        break;
      case 'views':
        orderBy = { viewCount: 'desc' };
        break;
      case 'latest':
      default:
        orderBy = { createdAt: 'desc' };
    }

    const where = {};
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 게시글 목록 조회
    const posts = await prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // 총 게시글 수 조회
    const total = await prisma.post.count({ where });

    return {
      posts,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 인기 게시글 목록 조회
   */
  async getPopularPosts(limit = 3) {
    const posts = await prisma.post.findMany({
      orderBy: [
        { likeCount: 'desc' },
        { viewCount: 'desc' },
      ],
      take: Number(limit),
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return {
      posts,
    };
  }

  /**
   * 게시글 검색
   */
  async searchPosts(query, { page = 1, limit = 10, sort = 'latest' }) {
    if (!query) {
      return {
        posts: [],
        total: 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: 0,
      };
    }

    const skip = (page - 1) * limit;
    
    let orderBy = {};
    switch (sort) {
      case 'popular':
        orderBy = { likeCount: 'desc' };
        break;
      case 'views':
        orderBy = { viewCount: 'desc' };
        break;
      case 'latest':
      default:
        orderBy = { createdAt: 'desc' };
    }

    const where = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ],
    };

    // 검색 결과 조회
    const posts = await prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // 검색 결과 총 개수
    const total = await prisma.post.count({ where });

    return {
      posts,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 특정 게시글 상세 조회 (조회수 증가 포함)
   */
  async getPostById(id, userId = null) {
    // 게시글 조회
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    // 조회수 증가 (트랜잭션 사용)
    const updatedPost = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        viewCount: post.viewCount + 1,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // 로그인한 사용자인 경우, 좋아요 여부 확인
    let isLiked = false;
    if (userId) {
      const like = await prisma.postLike.findUnique({
        where: {
          userId_postId: {
            userId: Number(userId),
            postId: Number(id),
          },
        },
      });
      isLiked = !!like;
    }

    return {
      ...updatedPost,
      isLiked,
    };
  }

  /**
   * 게시글 작성
   */
  async createPost(userId, postData) {
    const { title, content, category } = postData;

    // 게시글 생성
    const post = await prisma.post.create({
      data: {
        title,
        content,
        category,
        author: {
          connect: { id: userId },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return post;
  }

  /**
   * 게시글 수정
   */
  async updatePost(id, userId, postData) {
    const { title, content, category } = postData;

    // 게시글 조회
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
    });

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    // 작성자 확인
    if (post.authorId !== Number(userId)) {
      throw new Error('게시글 수정 권한이 없습니다.');
    }

    // 게시글 수정
    const updatedPost = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        title,
        content,
        category,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return updatedPost;
  }

  /**
   * 게시글 삭제
   */
  async deletePost(id, userId) {
    // 게시글 조회
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
    });

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    // 작성자 확인
    if (post.authorId !== Number(userId)) {
      throw new Error('게시글 삭제 권한이 없습니다.');
    }

    // 게시글 삭제
    await prisma.post.delete({
      where: { id: Number(id) },
    });

    return { success: true };
  }

  /**
   * 게시글 좋아요 등록
   */
  async likePost(id, userId) {
    // 게시글 존재 여부 확인
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
    });

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: Number(userId),
          postId: Number(id),
        },
      },
    });

    if (existingLike) {
      throw new Error('이미 좋아요를 누른 게시글입니다.');
    }

    // 트랜잭션 사용하여 좋아요 등록 및 카운트 증가
    const [postLike, updatedPost] = await prisma.$transaction([
      // 좋아요 생성
      prisma.postLike.create({
        data: {
          user: { connect: { id: Number(userId) } },
          post: { connect: { id: Number(id) } },
        },
      }),
      // 좋아요 카운트 증가
      prisma.post.update({
        where: { id: Number(id) },
        data: {
          likeCount: {
            increment: 1,
          },
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      }),
    ]);

    return {
      ...updatedPost,
      isLiked: true,
    };
  }

  /**
   * 게시글 좋아요 취소
   */
  async unlikePost(id, userId) {
    // 게시글 존재 여부 확인
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
    });

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    // 좋아요 존재 여부 확인
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: Number(userId),
          postId: Number(id),
        },
      },
    });

    if (!existingLike) {
      throw new Error('좋아요를 누르지 않은 게시글입니다.');
    }

    // 트랜잭션 사용하여 좋아요 삭제 및 카운트 감소
    const updatedPost = await prisma.$transaction(async (tx) => {
      // 좋아요 삭제
      await tx.postLike.delete({
        where: {
          userId_postId: {
            userId: Number(userId),
            postId: Number(id),
          },
        },
      });

      // 좋아요 카운트 감소
      return tx.post.update({
        where: { id: Number(id) },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    });

    return {
      ...updatedPost,
      isLiked: false,
    };
  }

  /**
   * 댓글 목록 조회
   */
  async getComments(postId, { page = 1, limit = 20 }, userId = null) {
    // 게시글 존재 여부 확인
    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
    });

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    const skip = (page - 1) * limit;

    // 댓글 목록 조회
    const comments = await prisma.comment.findMany({
      where: { postId: Number(postId) },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // 로그인한 사용자인 경우, 댓글의 좋아요 여부 확인
    let commentsWithLikeInfo = comments;
    if (userId) {
      const commentIds = comments.map(comment => comment.id);
      const userLikes = await prisma.commentLike.findMany({
        where: {
          userId: Number(userId),
          commentId: { in: commentIds },
        },
      });

      const likedCommentIds = new Set(userLikes.map(like => like.commentId));
      commentsWithLikeInfo = comments.map(comment => ({
        ...comment,
        isLiked: likedCommentIds.has(comment.id),
      }));
    }

    // 총 댓글 수 조회
    const total = await prisma.comment.count({
      where: { postId: Number(postId) },
    });

    return {
      comments: commentsWithLikeInfo,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 댓글 작성
   */
  async createComment(postId, userId, content) {
    // 게시글 존재 여부 확인
    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
    });

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    // 트랜잭션 사용하여 댓글 생성 및 게시글 댓글 수 증가
    const [comment, _] = await prisma.$transaction([
      // 댓글 생성
      prisma.comment.create({
        data: {
          content,
          author: { connect: { id: Number(userId) } },
          post: { connect: { id: Number(postId) } },
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      }),
      // 게시글 댓글 수 증가
      prisma.post.update({
        where: { id: Number(postId) },
        data: {
          commentCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return comment;
  }

  /**
   * 댓글 삭제
   */
  async deleteComment(postId, commentId, userId) {
    // 게시글 존재 여부 확인
    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
    });

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    // 댓글 조회
    const comment = await prisma.comment.findUnique({
      where: { 
        id: Number(commentId),
        postId: Number(postId),
      },
    });

    if (!comment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    // 작성자 확인
    if (comment.authorId !== Number(userId)) {
      throw new Error('댓글 삭제 권한이 없습니다.');
    }

    // 트랜잭션 사용하여 댓글 삭제 및 게시글 댓글 수 감소
    await prisma.$transaction([
      // 댓글 삭제
      prisma.comment.delete({
        where: { id: Number(commentId) },
      }),
      // 게시글 댓글 수 감소
      prisma.post.update({
        where: { id: Number(postId) },
        data: {
          commentCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    return { success: true };
  }

  /**
   * 댓글 좋아요 등록
   */
  async likeComment(postId, commentId, userId) {
    // 게시글과 댓글 존재 여부 확인
    const comment = await prisma.comment.findUnique({
      where: {
        id: Number(commentId),
        postId: Number(postId),
      },
    });

    if (!comment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: Number(userId),
          commentId: Number(commentId),
        },
      },
    });

    if (existingLike) {
      throw new Error('이미 좋아요를 누른 댓글입니다.');
    }

    // 트랜잭션 사용하여 좋아요 등록 및 카운트 증가
    const [commentLike, updatedComment] = await prisma.$transaction([
      // 좋아요 생성
      prisma.commentLike.create({
        data: {
          user: { connect: { id: Number(userId) } },
          comment: { connect: { id: Number(commentId) } },
        },
      }),
      // 좋아요 카운트 증가
      prisma.comment.update({
        where: { id: Number(commentId) },
        data: {
          likeCount: {
            increment: 1,
          },
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      }),
    ]);

    return {
      ...updatedComment,
      isLiked: true,
    };
  }

  /**
   * 댓글 좋아요 취소
   */
  async unlikeComment(postId, commentId, userId) {
    // 게시글과 댓글 존재 여부 확인
    const comment = await prisma.comment.findUnique({
      where: {
        id: Number(commentId),
        postId: Number(postId),
      },
    });

    if (!comment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    // 좋아요 존재 여부 확인
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: Number(userId),
          commentId: Number(commentId),
        },
      },
    });

    if (!existingLike) {
      throw new Error('좋아요를 누르지 않은 댓글입니다.');
    }

    // 트랜잭션 사용하여 좋아요 삭제 및 카운트 감소
    const updatedComment = await prisma.$transaction(async (tx) => {
      // 좋아요 삭제
      await tx.commentLike.delete({
        where: {
          userId_commentId: {
            userId: Number(userId),
            commentId: Number(commentId),
          },
        },
      });

      // 좋아요 카운트 감소
      return tx.comment.update({
        where: { id: Number(commentId) },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    });

    return {
      ...updatedComment,
      isLiked: false,
    };
  }
}

module.exports = new CommunityService(); 