const docsService = require('../services/docsService');

/**
 * 기술 문서 관련 요청을 처리하는 컨트롤러
 */
const docsController = {
  /**
   * 문서 목록 조회
   * GET /api/docs
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
      
      const result = await docsService.getDocuments(options);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 경로로 문서 조회
   * GET /api/docs/path/:path
   */
  getDocumentByPath: async (req, res, next) => {
    try {
      const path = req.params.path;
      const document = await docsService.getDocumentByPath(path);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          error: '문서를 찾을 수 없습니다.'
        });
      }
      
      res.json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * ID로 문서 조회
   * GET /api/docs/:id
   */
  getDocumentById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const document = await docsService.getDocumentById(id);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          error: '문서를 찾을 수 없습니다.'
        });
      }
      
      res.json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 카테고리별 문서 조회
   * GET /api/docs/category/:path
   */
  getDocumentsByCategory: async (req, res, next) => {
    try {
      const { path } = req.params;
      const documents = await docsService.getDocumentsByCategory(path);
      
      res.json({
        success: true,
        data: documents
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 인기 문서 조회
   * GET /api/docs/popular
   */
  getPopularDocuments: async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const documents = await docsService.getPopularDocuments(limit);
      
      res.json({
        success: true,
        data: documents
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 최신 문서 조회
   * GET /api/docs/recent
   */
  getRecentDocuments: async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const documents = await docsService.getRecentDocuments(limit);
      
      res.json({
        success: true,
        data: documents
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 문서 검색
   * GET /api/docs/search
   */
  searchDocuments: async (req, res, next) => {
    try {
      const { query } = req.query;
      
      if (!query) {
        return res.json({
          success: true,
          data: []
        });
      }
      
      const documents = await docsService.searchDocuments(query);
      
      res.json({
        success: true,
        data: documents
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 문서 생성
   * POST /api/docs
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
      const newDocument = await docsService.createDocument(documentData, req.user.id);
      
      res.status(201).json({
        success: true,
        data: newDocument
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 문서 수정
   * PUT /api/docs/:id
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
      
      const { id } = req.params;
      const updates = req.body;
      
      const updatedDocument = await docsService.updateDocument(id, updates, req.user.id);
      
      res.json({
        success: true,
        data: updatedDocument
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 문서 삭제
   * DELETE /api/docs/:id
   */
  deleteDocument: async (req, res, next) => {
    try {
      // 인증 확인 (관리자 또는 모더레이터만 삭제 가능)
      if (!req.user || !['ADMIN', 'MODERATOR'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: '문서 삭제 권한이 없습니다.'
        });
      }
      
      const { id } = req.params;
      const result = await docsService.deleteDocument(id);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          error: '문서를 찾을 수 없습니다.'
        });
      }
      
      res.json({
        success: true,
        message: '문서가 삭제되었습니다.'
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 문서 발행 상태 변경
   * PUT /api/docs/:id/publish
   */
  togglePublishStatus: async (req, res, next) => {
    try {
      // 인증 확인 (관리자 또는 모더레이터만 발행 상태 변경 가능)
      if (!req.user || !['ADMIN', 'MODERATOR'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: '문서 발행 상태 변경 권한이 없습니다.'
        });
      }
      
      const { id } = req.params;
      const { isPublished } = req.body;
      
      if (isPublished === undefined) {
        return res.status(400).json({
          success: false,
          error: 'isPublished 필드가 필요합니다.'
        });
      }
      
      const document = await docsService.togglePublishStatus(id, isPublished, req.user.id);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          error: '문서를 찾을 수 없습니다.'
        });
      }
      
      res.json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 문서 변경 요청 생성
   * POST /api/docs/:id/change-requests
   */
  createChangeRequest: async (req, res, next) => {
    try {
      // 인증 확인
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }
      
      const { id } = req.params;
      const { proposedContent, reason } = req.body;
      
      if (!proposedContent) {
        return res.status(400).json({
          success: false,
          error: '제안 내용이 필요합니다.'
        });
      }
      
      const changeRequest = await docsService.createChangeRequest(
        id, 
        proposedContent,
        reason || '',
        req.user.id
      );
      
      res.status(201).json({
        success: true,
        data: changeRequest
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 문서별 변경 요청 목록 조회
   * GET /api/docs/:id/change-requests
   */
  getChangeRequestsByDocument: async (req, res, next) => {
    try {
      const { id } = req.params;
      const requests = await docsService.getChangeRequestsByDocument(id);
      
      res.json({
        success: true,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 변경 요청 검토
   * PUT /api/docs/change-requests/:id
   */
  reviewChangeRequest: async (req, res, next) => {
    try {
      // 인증 확인 (관리자만 검토 가능)
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: '관리자만 변경 요청을 검토할 수 있습니다.'
        });
      }
      
      const { id } = req.params;
      const { status, reviewComment } = req.body;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: '유효하지 않은 상태값입니다. (approved/rejected)'
        });
      }
      
      const updatedRequest = await docsService.reviewChangeRequest(
        id,
        status,
        reviewComment || '',
        req.user.id
      );
      
      res.json({
        success: true,
        data: updatedRequest
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 문서 이력 조회
   * GET /api/docs/:id/history
   */
  getDocumentHistory: async (req, res, next) => {
    try {
      const { id } = req.params;
      const history = await docsService.getDocumentHistory(id);
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 변경 요청 목록 조회
   * GET /api/docs/change-requests
   */
  getChangeRequests: async (req, res, next) => {
    try {
      // 관리자만 모든 변경 요청 조회 가능
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: '관리자만 변경 요청 목록을 조회할 수 있습니다.'
        });
      }
      
      const { status } = req.query;
      const requests = await docsService.getChangeRequests(status);
      
      res.json({
        success: true,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 변경 요청 상세 조회
   * GET /api/docs/change-requests/:id
   */
  getChangeRequestById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const request = await docsService.getChangeRequestById(id);
      
      if (!request) {
        return res.status(404).json({
          success: false,
          error: '변경 요청을 찾을 수 없습니다.'
        });
      }
      
      // 작성자, 관리자만 변경 요청 상세 조회 가능
      if (
        !req.user || 
        (req.user.id !== request.proposedByUser.id && req.user.role !== 'ADMIN')
      ) {
        return res.status(403).json({
          success: false,
          error: '이 변경 요청을 조회할 권한이 없습니다.'
        });
      }
      
      res.json({
        success: true,
        data: request
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 카테고리 목록 조회
   * GET /api/docs/categories
   */
  getCategories: async (req, res, next) => {
    try {
      const categories = await docsService.getAllCategories();
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 카테고리 생성
   * POST /api/docs/categories
   */
  createCategory: async (req, res, next) => {
    try {
      // 관리자 또는 모더레이터만 카테고리 생성 가능
      if (!req.user || !['ADMIN', 'MODERATOR'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: '카테고리 생성 권한이 없습니다.'
        });
      }
      
      const categoryData = req.body;
      const newCategory = await docsService.createCategory(categoryData);
      
      res.status(201).json({
        success: true,
        data: newCategory
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 카테고리 수정
   * PUT /api/docs/categories/:id
   */
  updateCategory: async (req, res, next) => {
    try {
      // 관리자 또는 모더레이터만 카테고리 수정 가능
      if (!req.user || !['ADMIN', 'MODERATOR'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: '카테고리 수정 권한이 없습니다.'
        });
      }
      
      const { id } = req.params;
      const updates = req.body;
      
      const updatedCategory = await docsService.updateCategory(id, updates);
      
      if (!updatedCategory) {
        return res.status(404).json({
          success: false,
          error: '카테고리를 찾을 수 없습니다.'
        });
      }
      
      res.json({
        success: true,
        data: updatedCategory
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * 카테고리 삭제
   * DELETE /api/docs/categories/:id
   */
  deleteCategory: async (req, res, next) => {
    try {
      // 관리자만 카테고리 삭제 가능
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: '카테고리 삭제 권한이 없습니다.'
        });
      }
      
      const { id } = req.params;
      const result = await docsService.deleteCategory(id);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          error: '카테고리를 찾을 수 없습니다.'
        });
      }
      
      res.json({
        success: true,
        message: '카테고리가 삭제되었습니다.'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = docsController; 