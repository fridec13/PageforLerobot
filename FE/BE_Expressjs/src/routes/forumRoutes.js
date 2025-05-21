const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { optionalAuth } = require('../middlewares/optionalAuthmiddleware');

/**
 * Topics 관련 라우트
 */
router.get('/topics', optionalAuth, forumController.getTopics);
router.get('/topics/:slug', optionalAuth, forumController.getTopicDetail);
router.post('/topics/:id/follow', authMiddleware, forumController.followTopic);
router.delete('/topics/:id/follow', authMiddleware, forumController.unfollowTopic);

/**
 * Posts 관련 라우트
 */
router.get('/posts', optionalAuth, forumController.getPosts);
router.get('/topics/:slug/posts', optionalAuth, forumController.getPostsByTopic);
router.get('/posts/:id', optionalAuth, forumController.getPostDetail);
router.post('/posts', authMiddleware, forumController.createPost);
router.put('/posts/:id', authMiddleware, forumController.updatePost);
router.delete('/posts/:id', authMiddleware, forumController.deletePost);
router.post('/posts/:id/like', authMiddleware, forumController.likePost);
router.delete('/posts/:id/like', authMiddleware, forumController.unlikePost);

/**
 * Comments 관련 라우트
 */
router.get('/posts/:postId/comments', optionalAuth, forumController.getComments);
router.post('/posts/:postId/comments', authMiddleware, forumController.createComment);
router.put('/posts/:postId/comments/:commentId', authMiddleware, forumController.updateComment);
router.delete('/posts/:postId/comments/:commentId', authMiddleware, forumController.deleteComment);
router.post('/posts/:postId/comments/:commentId/like', authMiddleware, forumController.likeComment);
router.delete('/posts/:postId/comments/:commentId/like', authMiddleware, forumController.unlikeComment);

/**
 * Users 관련 라우트
 */
router.get('/users', optionalAuth, forumController.getUsers);
router.get('/users/:username', optionalAuth, forumController.getUserDetail);
router.get('/users/:username/posts', optionalAuth, forumController.getUserPosts);
router.get('/users/:username/comments', optionalAuth, forumController.getUserComments);
router.post('/users/:username/follow', authMiddleware, forumController.followUser);
router.delete('/users/:username/follow', authMiddleware, forumController.unfollowUser);

/**
 * Badges 관련 라우트
 */
router.get('/badges', optionalAuth, forumController.getBadges);
router.get('/badges/:id', optionalAuth, forumController.getBadgeDetail);
router.get('/badges/:id/users', optionalAuth, forumController.getBadgeUsers);

/**
 * Groups 관련 라우트
 */
router.get('/groups', optionalAuth, forumController.getGroups);
router.get('/groups/:slug', optionalAuth, forumController.getGroupDetail);
router.get('/groups/:slug/posts', optionalAuth, forumController.getGroupPosts);
router.get('/groups/:slug/members', optionalAuth, forumController.getGroupMembers);
router.post('/groups/:slug/join', authMiddleware, forumController.joinGroup);
router.delete('/groups/:slug/leave', authMiddleware, forumController.leaveGroup);

/**
 * Search 관련 라우트
 */
router.get('/search', optionalAuth, forumController.searchForum);

module.exports = router; 