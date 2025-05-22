const express = require('express');
const router = express.Router();
const GuestbookController = require('../controllers/guestbookController');
const { authenticateJWT } = require('../middlewares/authMiddleware');
const optionalAuth = require('../middlewares/optionalAuthmiddleware');

/**
 * 방명록 라우트 설정
 * 기본 경로: /api/guestbook
 */

// 방명록 목록 조회 (인증 선택적)
router.get('/', optionalAuth, GuestbookController.getEntries);

// 방명록 작성 (인증 선택적 - 익명 작성 허용)
router.post('/', optionalAuth, GuestbookController.createEntry);

// 방명록 삭제 (인증 필수 - 본인 작성 또는 관리자만 가능)
router.delete('/:id', authenticateJWT, GuestbookController.deleteEntry);

// 방명록 승인 상태 변경 (관리자 전용)
router.patch('/:id/approval', authenticateJWT, GuestbookController.updateApproval);

module.exports = router; 