const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { optionalAuthMiddleware } = require('../middlewares/optionalAuthmiddleware');

// 게시글 관련 라우트
router.get('/posts', optionalAuthMiddleware, communityController.getPosts);
router.get('/posts/popular', optionalAuthMiddleware, communityController.getPopularPosts);
router.get('/posts/search', optionalAuthMiddleware, communityController.searchPosts);
router.post('/posts', authMiddleware, communityController.createPost);
router.get('/posts/:id', optionalAuthMiddleware, communityController.getPostById);
router.put('/posts/:id', authMiddleware, communityController.updatePost);
router.delete('/posts/:id', authMiddleware, communityController.deletePost);

// 게시글 좋아요 관련 라우트
router.post('/posts/:id/like', authMiddleware, communityController.likePost);
router.delete('/posts/:id/like', authMiddleware, communityController.unlikePost);

// 댓글 관련 라우트
router.get('/posts/:postId/comments', optionalAuthMiddleware, communityController.getComments);
router.post('/posts/:postId/comments', authMiddleware, communityController.createComment);
router.delete('/posts/:postId/comments/:commentId', authMiddleware, communityController.deleteComment);

// 댓글 좋아요 관련 라우트
router.post('/posts/:postId/comments/:commentId/like', authMiddleware, communityController.likeComment);
router.delete('/posts/:postId/comments/:commentId/like', authMiddleware, communityController.unlikeComment);

module.exports = router; 