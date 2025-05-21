const express = require('express');
const router = express.Router();
const LeaderboardController = require('../controllers/leaderboard.controller');
const { optionalAuth } = require('../middlewares/auth.middleware');

/**
 * 리더보드 라우트 설정
 * 기본 경로: /api/leaderboard
 */

// 기여자 목록 조회
router.get('/contributors', optionalAuth, LeaderboardController.getContributors);

// 특정 기여자 상세 정보 조회
router.get('/contributors/:id', optionalAuth, LeaderboardController.getContributorDetail);

// 활발한 기여자 목록 조회
router.get('/most-active', optionalAuth, LeaderboardController.getMostActiveContributors);

// 특정 카테고리의 기여자 조회
router.get('/category/:category', optionalAuth, LeaderboardController.getCategoryContributors);

// 레벨 정보 조회
router.get('/levels', LeaderboardController.getLevels);

module.exports = router; 