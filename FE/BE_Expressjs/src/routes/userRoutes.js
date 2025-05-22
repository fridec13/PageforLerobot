const express = require('express');
const userController = require('../controllers/userController');
const { authenticateJWT, hasRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// 인증이 필요한 모든 라우트에 미들웨어 적용
router.use(authenticateJWT);

// 현재 사용자 정보 조회
router.get('/me', userController.getCurrentUser);

// 사용자 프로필 업데이트
router.patch('/me', userController.updateProfile);

// 비밀번호 변경
router.post('/change-password', userController.changePassword);

// 사용자의 기여 내역 조회
router.get('/contributions', userController.getMyContributions);

// 칭호 목록 조회
router.get('/titles', userController.getTitles);

// 활성 칭호 설정
router.post('/title', userController.setActiveTitle);

// 사용자의 메시지 목록 조회
router.get('/messages', userController.getMyMessages);

// 메시지 읽음 처리
router.patch('/messages/:messageId', userController.markMessageAsRead);

// 메시지 삭제
router.delete('/messages/:messageId', userController.deleteMessage);

// 메시지 전송 (관리자/모더레이터 전용)
router.post('/messages', hasRole(['ADMIN', 'MODERATOR']), userController.sendMessage);

// 특정 사용자 정보 조회
router.get('/:userId', userController.getUserProfile);

// 사용자 목록 조회 (관리자 전용)
router.get('/', hasRole(['ADMIN', 'MODERATOR']), userController.getAllUsers);

module.exports = router; 