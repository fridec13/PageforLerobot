const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthmiddleware');
const communityController = require('../controllers/communityController');

// 게시글 관련 라우트
router.get('/posts', optionalAuthMiddleware, communityController.getPosts);
router.get('/posts/popular', optionalAuthMiddleware, communityController.getPopularPosts);
router.get('/posts/search', optionalAuthMiddleware, communityController.searchPosts);
router.post('/posts', authenticateJWT, communityController.createPost);
router.get('/posts/:id', optionalAuthMiddleware, communityController.getPostById);
router.put('/posts/:id', authenticateJWT, communityController.updatePost);
router.delete('/posts/:id', authenticateJWT, communityController.deletePost);

// 게시글 좋아요 관련 라우트
router.post('/posts/:id/like', authenticateJWT, communityController.likePost);
router.delete('/posts/:id/like', authenticateJWT, communityController.unlikePost);

// 댓글 관련 라우트
router.get('/posts/:postId/comments', optionalAuthMiddleware, communityController.getComments);
router.post('/posts/:postId/comments', authenticateJWT, communityController.createComment);
router.delete('/posts/:postId/comments/:commentId', authenticateJWT, communityController.deleteComment);

// 댓글 좋아요 관련 라우트
router.post('/posts/:postId/comments/:commentId/like', authenticateJWT, communityController.likeComment);
router.delete('/posts/:postId/comments/:commentId/like', authenticateJWT, communityController.unlikeComment);

module.exports = router; 