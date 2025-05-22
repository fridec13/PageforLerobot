const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const forumService = require('../services/forumService');

/**
 * Topics 관련 컨트롤러
 */
exports.getTopics = async (req, res, next) => {
  try {
    const { page, limit, sort } = req.query;
    const topics = await forumService.getTopics(req.user?.id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sort: sort || 'popular'
    });
    
    res.json({
      success: true,
      data: topics
    });
  } catch (error) {
    next(error);
  }
};

exports.getTopicDetail = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const topic = await forumService.getTopicDetail(req.user?.id, slug);
    
    res.json({
      success: true,
      data: topic
    });
  } catch (error) {
    next(error);
  }
};

exports.followTopic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await forumService.followTopic(req.user.id, parseInt(id));
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.unfollowTopic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await forumService.unfollowTopic(req.user.id, parseInt(id));
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Posts 관련 컨트롤러
 */
exports.getPosts = async (req, res, next) => {
  try {
    const { page, limit, sort, query, tags, topicId, groupId, userId } = req.query;
    const posts = await forumService.getPosts(req.user?.id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sort: sort || 'recent',
      query,
      tags: tags ? tags.split(',') : undefined,
      topicId: topicId ? parseInt(topicId) : undefined,
      groupId: groupId ? parseInt(groupId) : undefined,
      userId: userId ? parseInt(userId) : undefined
    });
    
    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

exports.getPostsByTopic = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { page, limit, sort } = req.query;
    const posts = await forumService.getPostsByTopic(req.user?.id, slug, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sort: sort || 'recent'
    });
    
    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

exports.getPostDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await forumService.getPostDetail(req.user?.id, parseInt(id));
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const { title, content, topicId, groupId, tags } = req.body;
    
    if (!title || !content || !topicId) {
      return res.status(400).json({
        success: false,
        error: '제목, 내용, 주제는 필수 항목입니다.'
      });
    }
    
    const post = await forumService.createPost(req.user.id, {
      title,
      content,
      topicId: parseInt(topicId),
      groupId: groupId ? parseInt(groupId) : undefined,
      tags
    });
    
    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, topicId, groupId, tags } = req.body;
    const post = await forumService.updatePost(req.user.id, parseInt(id), {
      title,
      content,
      topicId: topicId ? parseInt(topicId) : undefined,
      groupId: groupId ? parseInt(groupId) : undefined,
      tags
    });
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    await forumService.deletePost(req.user.id, parseInt(id));
    
    res.json({
      success: true,
      message: '게시글이 삭제되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};

exports.likePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await forumService.likePost(req.user.id, parseInt(id));
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.unlikePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await forumService.unlikePost(req.user.id, parseInt(id));
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Comments 관련 컨트롤러
 */
exports.getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { page, limit } = req.query;
    const comments = await forumService.getComments(req.user?.id, parseInt(postId), {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50
    });
    
    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    next(error);
  }
};

exports.createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content, parentId } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: '댓글 내용은 필수입니다.'
      });
    }
    
    const comment = await forumService.createComment(
      req.user.id,
      parseInt(postId),
      content,
      parentId ? parseInt(parentId) : undefined
    );
    
    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: '댓글 내용은 필수입니다.'
      });
    }
    
    const comment = await forumService.updateComment(
      req.user.id,
      parseInt(postId),
      parseInt(commentId),
      content
    );
    
    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    await forumService.deleteComment(req.user.id, parseInt(postId), parseInt(commentId));
    
    res.json({
      success: true,
      message: '댓글이 삭제되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};

exports.likeComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const result = await forumService.likeComment(req.user.id, parseInt(postId), parseInt(commentId));
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.unlikeComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const result = await forumService.unlikeComment(req.user.id, parseInt(postId), parseInt(commentId));
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Users 관련 컨트롤러
 */
exports.getUsers = async (req, res, next) => {
  try {
    const { page, limit, sort } = req.query;
    const users = await forumService.getUsers(req.user?.id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sort: sort || 'popular'
    });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserDetail = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await forumService.getUserDetail(req.user?.id, username);
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserPosts = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { page, limit } = req.query;
    const posts = await forumService.getUserPosts(req.user?.id, username, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    
    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserComments = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { page, limit } = req.query;
    const comments = await forumService.getUserComments(req.user?.id, username, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    
    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    next(error);
  }
};

exports.followUser = async (req, res, next) => {
  try {
    const { username } = req.params;
    const result = await forumService.followUser(req.user.id, username);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.unfollowUser = async (req, res, next) => {
  try {
    const { username } = req.params;
    const result = await forumService.unfollowUser(req.user.id, username);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Badges 관련 컨트롤러
 */
exports.getBadges = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const badges = await forumService.getBadges({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    
    res.json({
      success: true,
      data: badges
    });
  } catch (error) {
    next(error);
  }
};

exports.getBadgeDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const badge = await forumService.getBadgeDetail(parseInt(id));
    
    res.json({
      success: true,
      data: badge
    });
  } catch (error) {
    next(error);
  }
};

exports.getBadgeUsers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;
    const users = await forumService.getBadgeUsers(parseInt(id), {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Groups 관련 컨트롤러
 */
exports.getGroups = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const groups = await forumService.getGroups(req.user?.id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    
    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    next(error);
  }
};

exports.getGroupDetail = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const group = await forumService.getGroupDetail(req.user?.id, slug);
    
    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    next(error);
  }
};

exports.getGroupPosts = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { page, limit } = req.query;
    const posts = await forumService.getGroupPosts(req.user?.id, slug, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    
    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

exports.getGroupMembers = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { page, limit } = req.query;
    const members = await forumService.getGroupMembers(slug, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    
    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    next(error);
  }
};

exports.joinGroup = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await forumService.joinGroup(req.user.id, slug);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.leaveGroup = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await forumService.leaveGroup(req.user.id, slug);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search 관련 컨트롤러
 */
exports.searchForum = async (req, res, next) => {
  try {
    const { query, page, limit, sort, tags, topicId, groupId, userId } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: '검색어는 필수입니다.'
      });
    }
    
    const results = await forumService.searchForum(req.user?.id, query, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sort: sort || 'relevance',
      tags: tags ? tags.split(',') : undefined,
      topicId: topicId ? parseInt(topicId) : undefined,
      groupId: groupId ? parseInt(groupId) : undefined,
      userId: userId ? parseInt(userId) : undefined
    });
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
}; 