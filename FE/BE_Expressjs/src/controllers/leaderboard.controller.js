const LeaderboardModel = require('../models/leaderboard.model');

/**
 * 리더보드 컨트롤러
 */
const LeaderboardController = {
  /**
   * 기여자 목록 조회
   * @param {Object} req 요청 객체
   * @param {Object} res 응답 객체
   */
  async getContributors(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const period = req.query.period || 'all';
      
      // 유효한 기간 확인
      const validPeriods = ['all', 'month', 'week', 'day'];
      if (!validPeriods.includes(period)) {
        return res.status(400).json({ message: '유효하지 않은 기간입니다. (all, month, week, day)' });
      }
      
      const result = await LeaderboardModel.getContributors({
        period,
        page,
        limit
      });
      
      res.status(200).json(result);
    } catch (error) {
      console.error('기여자 목록 조회 오류:', error);
      res.status(500).json({ message: '기여자 목록을 조회하는 중 오류가 발생했습니다.' });
    }
  },
  
  /**
   * 특정 기여자 상세 정보 조회
   * @param {Object} req 요청 객체
   * @param {Object} res 응답 객체
   */
  async getContributorDetail(req, res) {
    try {
      const { id } = req.params;
      
      const contributorDetail = await LeaderboardModel.getContributorDetail(id);
      
      if (!contributorDetail) {
        return res.status(404).json({ message: '존재하지 않는 기여자입니다.' });
      }
      
      res.status(200).json(contributorDetail);
    } catch (error) {
      console.error('기여자 상세 정보 조회 오류:', error);
      res.status(500).json({ message: '기여자 정보를 조회하는 중 오류가 발생했습니다.' });
    }
  },
  
  /**
   * 활발한 기여자 목록 조회
   * @param {Object} req 요청 객체
   * @param {Object} res 응답 객체
   */
  async getMostActiveContributors(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      
      // 최대 20명까지만 조회 가능
      const limitCapped = Math.min(limit, 20);
      
      const activeContributors = await LeaderboardModel.getMostActiveContributors(limitCapped);
      
      res.status(200).json({ contributors: activeContributors });
    } catch (error) {
      console.error('활발한 기여자 목록 조회 오류:', error);
      res.status(500).json({ message: '활발한 기여자 목록을 조회하는 중 오류가 발생했습니다.' });
    }
  },
  
  /**
   * 특정 카테고리의 기여자 조회
   * @param {Object} req 요청 객체
   * @param {Object} res 응답 객체
   */
  async getCategoryContributors(req, res) {
    try {
      const { category } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      
      // 유효한 카테고리 확인
      const validCategories = ['wiki', 'docs', 'forum', 'code'];
      if (!validCategories.includes(category.toLowerCase())) {
        return res.status(400).json({ 
          message: '유효하지 않은 카테고리입니다.',
          validCategories
        });
      }
      
      const contributors = await LeaderboardModel.getCategoryContributors(
        category.toLowerCase(),
        Math.min(limit, 20) // 최대 20명까지만 조회 가능
      );
      
      res.status(200).json({ category, contributors });
    } catch (error) {
      console.error(`${req.params.category} 카테고리 기여자 조회 오류:`, error);
      res.status(500).json({ message: '카테고리 기여자 목록을 조회하는 중 오류가 발생했습니다.' });
    }
  },
  
  /**
   * 모든 레벨 정보 조회
   * @param {Object} req 요청 객체
   * @param {Object} res 응답 객체
   */
  async getLevels(req, res) {
    try {
      const levels = await LeaderboardModel.getLevels();
      
      res.status(200).json({ levels });
    } catch (error) {
      console.error('레벨 정보 조회 오류:', error);
      res.status(500).json({ message: '레벨 정보를 조회하는 중 오류가 발생했습니다.' });
    }
  }
};

module.exports = LeaderboardController; 