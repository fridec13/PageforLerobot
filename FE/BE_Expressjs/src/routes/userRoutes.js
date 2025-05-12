const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// 인증이 필요한 모든 라우트에 미들웨어 적용
router.use(authMiddleware);

// 현재 사용자 정보 조회
router.get('/me', userController.getCurrentUser);

// 사용자 프로필 업데이트
router.patch('/me', userController.updateProfile);

// 비밀번호 변경
router.post('/change-password', userController.changePassword);

// 사용자 목록 조회 (관리자 전용)
router.get('/', authMiddleware.hasRole(['ADMIN', 'MODERATOR']), userController.getAllUsers);

module.exports = router; 