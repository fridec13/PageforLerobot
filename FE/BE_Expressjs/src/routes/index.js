const express = require('express');
const authRoutes = require('./auth');
const usersRoutes = require('./users');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API 서버가 정상적으로 작동 중입니다.' });
});

// 라우트 등록
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);

// 추후 추가될 라우트들:
// router.use('/docs', docsRoutes);
// router.use('/wiki', wikiRoutes);
// router.use('/forum', forumRoutes);
// router.use('/community', communityRoutes);

module.exports = router; 