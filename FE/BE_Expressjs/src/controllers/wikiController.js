const wikiService = require('../services/wikiService');

/**
 * 위키 문서 관련 요청을 처리하는 컨트롤러
 */
const wikiController = {
  /**
   * 위키 문서 목록 조회
   * GET /api/wiki
   */
  getDocuments: async (req, res, next) => {
    try {
      const options = {
        category: req.query.category,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        query: req.query.query
      };
      
      const result = await wikiService.getDocuments(options);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 인기 위키 문서 조회
   * GET /api/wiki/popular
   */
  getPopularDocuments: async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 4;
      const documents = await wikiService.getPopularDocuments(limit);
      
      res.json({
        success: true,
        data: documents
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 최근 수정된 위키 문서 조회
   * GET /api/wiki/recent
   */
  getRecentDocuments: async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 3;
      const documents = await wikiService.getRecentDocuments(limit);
      
      res.json({
        success: true,
        data: documents
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 특정 슬러그의 위키 문서 조회
   * GET /api/wiki/:slug
   */
  getDocumentBySlug: async (req, res, next) => {
    try {
      const { slug } = req.params;
      const document = await wikiService.getDocumentBySlug(slug);
      
      res.json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 새 위키 문서 생성
   * POST /api/wiki
   */
  createDocument: async (req, res, next) => {
    try {
      // 인증 확인
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }
      
      const documentData = req.body;
      const newDocument = await wikiService.createDocument(documentData, req.user.id);
      
      res.status(201).json({
        success: true,
        data: newDocument
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 위키 문서 수정
   * PUT /api/wiki/:slug
   */
  updateDocument: async (req, res, next) => {
    try {
      // 인증 확인
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }
      
      const { slug } = req.params;
      const updates = req.body;
      const comment = updates.comment;
      
      // 수정 내용에서 comment 필드 제거
      delete updates.comment;
      
      const updatedDocument = await wikiService.updateDocument(slug, updates, comment, req.user.id);
      
      res.json({
        success: true,
        data: updatedDocument
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 위키 문서 삭제
   * DELETE /api/wiki/:slug
   */
  deleteDocument: async (req, res, next) => {
    try {
      // 인증 확인 (관리자만 삭제 가능)
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: '관리자만 문서를 삭제할 수 있습니다.'
        });
      }
      
      const { slug } = req.params;
      await wikiService.deleteDocument(slug);
      
      res.json({
        success: true,
        message: '문서가 삭제되었습니다.'
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 문서 수정 이력 조회
   * GET /api/wiki/:slug/revisions
   */
  getRevisions: async (req, res, next) => {
    try {
      const { slug } = req.params;
      const revisions = await wikiService.getRevisions(slug);
      
      res.json({
        success: true,
        data: revisions
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 문서 토론 목록 조회
   * GET /api/wiki/:slug/discussions
   */
  getDiscussions: async (req, res, next) => {
    try {
      const { slug } = req.params;
      const discussions = await wikiService.getDiscussions(slug);
      
      res.json({
        success: true,
        data: discussions
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 위키 검색
   * GET /api/wiki/search
   */
  search: async (req, res, next) => {
    try {
      const { query } = req.query;
      const options = {
        category: req.query.category,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };
      
      const results = await wikiService.search(query, options);
      
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 카테고리 목록 조회
   * GET /api/wiki/categories
   */
  getCategories: async (req, res, next) => {
    try {
      const categories = await wikiService.getCategories();
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = wikiController; 