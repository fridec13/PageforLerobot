const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

// 인증이 필요한 라우트에 미들웨어 적용
router.use(authMiddleware);

// 현재 로그인한 사용자 정보 조회
router.get('/me', userController.getCurrentUser);

// 사용자 프로필 업데이트
router.patch('/me', userController.updateProfile);

// 비밀번호 변경
router.post('/password', userController.changePassword);

// 기여 내역 조회
router.get('/contributions', userController.getContributions);

// 메시지 목록 조회
router.get('/messages', userController.getMessages);

// 메시지 읽음 처리
router.patch('/messages/:id', userController.markMessageAsRead);

// 메시지 삭제
router.delete('/messages/:id', userController.deleteMessage);

// 메시지 전송
router.post('/messages', userController.sendMessage);

// 칭호 목록 조회
router.get('/titles', userController.getTitles);

// 칭호 설정
router.post('/title', userController.setTitle);

// 다른 사용자 프로필 조회 (관리자/모더레이터 전용)
router.get('/:id', authMiddleware.hasRole(['admin', 'moderator']), userController.getUserProfile);

module.exports = router; 