const express = require('express');
const router = express.Router();
const docsController = require('../controllers/docsController');
const { authenticateJWT, optionalAuthenticateJWT } = require('../middlewares/authMiddleware');

/**
 * 기술 문서 라우트 정의
 * 기본 경로: /api/docs
 */

// 문서 목록 조회 (인증 불필요)
router.get('/', optionalAuthenticateJWT, docsController.getDocuments);

// 카테고리 목록 조회 (인증 불필요)
router.get('/categories', optionalAuthenticateJWT, docsController.getCategories);

// 카테고리별 문서 조회 (인증 불필요)
router.get('/category/:path', optionalAuthenticateJWT, docsController.getDocumentsByCategory);

// 경로로 문서 조회 (인증 불필요)
router.get('/path/:path', optionalAuthenticateJWT, docsController.getDocumentByPath);

// 변경 요청 목록 조회 (관리자 인증 필요)
router.get('/change-requests', authenticateJWT, docsController.getChangeRequests);

// 변경 요청 상세 조회 (인증 필요)
router.get('/change-requests/:id', authenticateJWT, docsController.getChangeRequestById);

// 변경 요청 검토 (관리자 인증 필요)
router.put('/change-requests/:id', authenticateJWT, docsController.reviewChangeRequest);

// 새 문서 생성 (인증 필요)
router.post('/', authenticateJWT, docsController.createDocument);

// ID로 문서 조회 (인증 불필요)
router.get('/:id', optionalAuthenticateJWT, docsController.getDocumentById);

// 문서 수정 (인증 필요)
router.put('/:id', authenticateJWT, docsController.updateDocument);

// 문서 이력 조회 (인증 불필요)
router.get('/:id/history', optionalAuthenticateJWT, docsController.getDocumentHistory);

// 변경 요청 생성 (인증 필요)
router.post('/:id/change-requests', authenticateJWT, docsController.createChangeRequest);

module.exports = router; 