const express = require('express');
const router = express.Router();
const wikiController = require('../controllers/wikiController');
const { authenticateJWT, optionalAuthenticateJWT } = require('../middlewares/authMiddleware');

/**
 * 위키 라우트 정의
 * 기본 경로: /api/wiki
 */

// 위키 문서 목록 조회 (인증 불필요)
router.get('/', optionalAuthenticateJWT, wikiController.getDocuments);

// 인기 위키 문서 조회 (인증 불필요)
router.get('/popular', optionalAuthenticateJWT, wikiController.getPopularDocuments);

// 최근 수정된 위키 문서 조회 (인증 불필요)
router.get('/recent', optionalAuthenticateJWT, wikiController.getRecentDocuments);

// 위키 검색 (인증 불필요)
router.get('/search', optionalAuthenticateJWT, wikiController.search);

// 카테고리 목록 조회 (인증 불필요)
router.get('/categories', optionalAuthenticateJWT, wikiController.getCategories);

// 새 위키 문서 생성 (인증 필요)
router.post('/', authenticateJWT, wikiController.createDocument);

// 특정 슬러그의 위키 문서 조회 (인증 불필요)
router.get('/:slug', optionalAuthenticateJWT, wikiController.getDocumentBySlug);

// 위키 문서 수정 (인증 필요)
router.put('/:slug', authenticateJWT, wikiController.updateDocument);

// 위키 문서 삭제 (관리자 인증 필요)
router.delete('/:slug', authenticateJWT, wikiController.deleteDocument);

// 문서 수정 이력 조회 (인증 불필요)
router.get('/:slug/revisions', optionalAuthenticateJWT, wikiController.getRevisions);

// 문서 토론 목록 조회 (인증 불필요)
router.get('/:slug/discussions', optionalAuthenticateJWT, wikiController.getDiscussions);

module.exports = router; 