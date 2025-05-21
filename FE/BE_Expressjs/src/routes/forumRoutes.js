const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middlewares/authMiddleware');
const optionalAuth = require('../middlewares/optionalAuthmiddleware');
const forumController = require('../controllers/forumController');

/**
 * Topics 관련 라우트
 */
router.get('/topics', optionalAuth, forumController.getTopics);
router.get('/topics/:slug', optionalAuth, forumController.getTopicDetail);
router.post('/topics/:id/follow', authenticateJWT, forumController.followTopic);
router.delete('/topics/:id/follow', authenticateJWT, forumController.unfollowTopic);

/**
 * Tags 관련 라우트
 */
router.get('/tags', optionalAuth, forumController.getTags);
router.get('/tags/:slug/posts', optionalAuth, forumController.getPostsByTag);

/**
 * Posts 관련 라우트
 */
router.get('/posts', optionalAuth, forumController.getPosts);
router.get('/topics/:slug/posts', optionalAuth, forumController.getPostsByTopic);
router.get('/posts/:id', optionalAuth, forumController.getPostDetail);
router.post('/posts', authenticateJWT, forumController.createPost);
router.put('/posts/:id', authenticateJWT, forumController.updatePost);
router.delete('/posts/:id', authenticateJWT, forumController.deletePost);
router.post('/posts/:id/like', authenticateJWT, forumController.likePost);
router.delete('/posts/:id/like', authenticateJWT, forumController.unlikePost);

/**
 * Comments 관련 라우트
 */
router.get('/posts/:postId/comments', optionalAuth, forumController.getComments);
router.post('/posts/:postId/comments', authenticateJWT, forumController.createComment);
router.put('/posts/:postId/comments/:commentId', authenticateJWT, forumController.updateComment);
router.delete('/posts/:postId/comments/:commentId', authenticateJWT, forumController.deleteComment);
router.post('/posts/:postId/comments/:commentId/like', authenticateJWT, forumController.likeComment);
router.delete('/posts/:postId/comments/:commentId/like', authenticateJWT, forumController.unlikeComment);

/**
 * Users 관련 라우트
 */
router.get('/users', optionalAuth, forumController.getUsers);
router.get('/users/:username', optionalAuth, forumController.getUserDetail);
router.get('/users/:username/posts', optionalAuth, forumController.getUserPosts);
router.get('/users/:username/comments', optionalAuth, forumController.getUserComments);
router.post('/users/:username/follow', authenticateJWT, forumController.followUser);
router.delete('/users/:username/follow', authenticateJWT, forumController.unfollowUser);

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
router.post('/groups/:slug/join', authenticateJWT, forumController.joinGroup);
router.delete('/groups/:slug/leave', authenticateJWT, forumController.leaveGroup);

/**
 * Search 관련 라우트
 */
router.get('/search', optionalAuth, forumController.searchForum);

module.exports = router; 