const communityService = require('../services/communityService');

/**
 * 게시글 목록 조회
 */
exports.getPosts = async (req, res, next) => {
  try {
    const { page, limit, sort, category, search } = req.query;
    const posts = await communityService.getPosts({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sort,
      category,
      search
    });
    
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

/**
 * 인기 게시글 조회
 */
exports.getPopularPosts = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const posts = await communityService.getPopularPosts(parseInt(limit) || 3);
    
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

/**
 * 게시글 검색
 */
exports.searchPosts = async (req, res, next) => {
  try {
    const { query, page, limit, sort } = req.query;
    const searchResults = await communityService.searchPosts(query, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sort
    });
    
    res.status(200).json(searchResults);
  } catch (error) {
    next(error);
  }
};

/**
 * 게시글 상세 조회
 */
exports.getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const post = await communityService.getPostById(id, userId);
    
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

/**
 * 게시글 생성
 */
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        error: '제목, 내용, 카테고리는 필수 입력 항목입니다.'
      });
    }
    
    const userId = req.user.id;
    const post = await communityService.createPost(userId, {
      title,
      content,
      category
    });
    
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

/**
 * 게시글 수정
 */
exports.updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;
    const userId = req.user.id;
    
    if (!title && !content && !category) {
      return res.status(400).json({
        success: false,
        error: '최소한 하나 이상의 항목을 수정해야 합니다.'
      });
    }
    
    const updatedPost = await communityService.updatePost(id, userId, {
      title,
      content,
      category
    });
    
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};

/**
 * 게시글 삭제
 */
exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await communityService.deletePost(id, userId);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * 게시글 좋아요
 */
exports.likePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await communityService.likePost(id, userId);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * 게시글 좋아요 취소
 */
exports.unlikePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await communityService.unlikePost(id, userId);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * 댓글 목록 조회
 */
exports.getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { page, limit } = req.query;
    const userId = req.user ? req.user.id : null;
    
    const comments = await communityService.getComments(
      postId,
      {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
      },
      userId
    );
    
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

/**
 * 댓글 생성
 */
exports.createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: '댓글 내용은 필수 입력 항목입니다.'
      });
    }
    
    const comment = await communityService.createComment(postId, userId, content);
    
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

/**
 * 댓글 삭제
 */
exports.deleteComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;
    
    const result = await communityService.deleteComment(postId, commentId, userId);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * 댓글 좋아요
 */
exports.likeComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;
    
    const result = await communityService.likeComment(postId, commentId, userId);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * 댓글 좋아요 취소
 */
exports.unlikeComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;
    
    const result = await communityService.unlikeComment(postId, commentId, userId);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}; 