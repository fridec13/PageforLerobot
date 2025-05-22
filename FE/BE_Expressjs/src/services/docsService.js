const docsModel = require('../models/docsModel');

/**
 * 문서 관련 서비스 함수
 */
const docsService = {
  /**
   * 모든 문서 조회
   * @param {Object} options - 필터링 및 정렬 옵션
   * @returns {Promise<{documents: Array, total: number}>}
   */
  getDocuments: async (options) => {
    return await docsModel.getAllDocuments(options);
  },

  /**
   * 경로로 문서 조회
   * @param {string} path - 문서 경로
   * @returns {Promise<Object>}
   */
  getDocumentByPath: async (path) => {
    return await docsModel.getDocumentByPath(path);
  },

  /**
   * ID로 문서 조회
   * @param {string} id - 문서 ID
   * @returns {Promise<Object>}
   */
  getDocumentById: async (id) => {
    return await docsModel.getDocumentById(id);
  },

  /**
   * 카테고리별 문서 조회
   * @param {string} categoryPath - 카테고리 경로
   * @returns {Promise<Array>}
   */
  getDocumentsByCategory: async (categoryPath) => {
    return await docsModel.getDocumentsByCategory(categoryPath);
  },

  /**
   * 인기 문서 조회
   * @param {number} limit - 조회할 문서 수
   * @returns {Promise<Array>}
   */
  getPopularDocuments: async (limit) => {
    return await docsModel.getPopularDocuments(limit);
  },

  /**
   * 최신 문서 조회
   * @param {number} limit - 조회할 문서 수
   * @returns {Promise<Array>}
   */
  getRecentDocuments: async (limit) => {
    return await docsModel.getRecentDocuments(limit);
  },

  /**
   * 문서 검색
   * @param {string} query - 검색어
   * @returns {Promise<Array>}
   */
  searchDocuments: async (query) => {
    return await docsModel.searchDocuments(query);
  },

  /**
   * 문서 생성
   * @param {Object} documentData - 문서 데이터
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>}
   */
  createDocument: async (documentData, userId) => {
    // 경로가 없는 경우 자동 생성
    if (!documentData.path) {
      const category = await docsModel.getAllCategories().find(
        cat => cat.id === documentData.categoryId
      );
      
      const categoryPath = category ? category.path : 'uncategorized';
      
      // 타이틀을 소문자화하고 공백을 -로 변경하여 경로 생성
      const titleSlug = documentData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // 특수문자 제거
        .replace(/\s+/g, '-'); // 공백을 -로 변경
      
      documentData.path = `${categoryPath}/${titleSlug}`;
    }
    
    return await docsModel.createDocument({
      ...documentData,
      userId
    });
  },

  /**
   * 문서 수정
   * @param {string} id - 문서 ID
   * @param {Object} updates - 변경 내용
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>}
   */
  updateDocument: async (id, updates, userId) => {
    // 경로 변경이 필요한 경우
    if (updates.title && !updates.path) {
      const document = await docsModel.getDocumentById(id);
      if (document) {
        const categoryPath = document.category.path;
        
        // 새 타이틀을 기반으로 경로 생성
        const titleSlug = updates.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        
        updates.path = `${categoryPath}/${titleSlug}`;
      }
    }
    
    return await docsModel.updateDocument(id, updates, userId);
  },

  /**
   * 문서 삭제
   * @param {string} id - 문서 ID
   * @returns {Promise<boolean>}
   */
  deleteDocument: async (id) => {
    return await docsModel.deleteDocument(id);
  },

  /**
   * 문서 발행 상태 변경
   * @param {string} id - 문서 ID
   * @param {boolean} isPublished - 발행 상태
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>}
   */
  togglePublishStatus: async (id, isPublished, userId) => {
    return await docsModel.togglePublishStatus(id, isPublished, userId);
  },

  /**
   * 문서 변경 요청 생성
   * @param {string} documentId - 문서 ID
   * @param {string} proposedContent - 변경 내용
   * @param {string} reason - 변경 이유
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>}
   */
  createChangeRequest: async (documentId, proposedContent, reason, userId) => {
    return await docsModel.createChangeRequest(documentId, proposedContent, reason, userId);
  },

  /**
   * 변경 요청 검토
   * @param {string} requestId - 요청 ID
   * @param {string} status - 상태 (approved/rejected)
   * @param {string} reviewComment - 검토 코멘트
   * @param {string} reviewerId - 검토자 ID
   * @returns {Promise<Object>}
   */
  reviewChangeRequest: async (requestId, status, reviewComment, reviewerId) => {
    return await docsModel.reviewChangeRequest(requestId, status, reviewComment, reviewerId);
  },

  /**
   * 문서 이력 조회
   * @param {string} documentId - 문서 ID
   * @returns {Promise<Array>}
   */
  getDocumentHistory: async (documentId) => {
    return await docsModel.getDocumentHistory(documentId);
  },

  /**
   * 문서별 변경 요청 목록 조회
   * @param {string} documentId - 문서 ID
   * @returns {Promise<Array>}
   */
  getChangeRequestsByDocument: async (documentId) => {
    return await docsModel.getChangeRequestsByDocument(documentId);
  },

  /**
   * 변경 요청 목록 조회
   * @param {string} status - 상태 필터 (optional)
   * @returns {Promise<Array>}
   */
  getChangeRequests: async (status) => {
    return await docsModel.getChangeRequests(status);
  },

  /**
   * 변경 요청 상세 조회
   * @param {string} requestId - 요청 ID
   * @returns {Promise<Object>}
   */
  getChangeRequestById: async (requestId) => {
    return await docsModel.getChangeRequestById(requestId);
  },

  /**
   * 모든 카테고리 조회
   * @returns {Promise<Array>}
   */
  getAllCategories: async () => {
    return await docsModel.getAllCategories();
  },

  /**
   * 카테고리 생성
   * @param {Object} categoryData - 카테고리 데이터
   * @returns {Promise<Object>}
   */
  createCategory: async (categoryData) => {
    return await docsModel.createCategory(categoryData);
  },

  /**
   * 카테고리 수정
   * @param {string} id - 카테고리 ID
   * @param {Object} categoryData - 카테고리 데이터
   * @returns {Promise<Object>}
   */
  updateCategory: async (id, categoryData) => {
    return await docsModel.updateCategory(id, categoryData);
  },

  /**
   * 카테고리 삭제
   * @param {string} id - 카테고리 ID
   * @returns {Promise<boolean>}
   */
  deleteCategory: async (id) => {
    return await docsModel.deleteCategory(id);
  }
};

module.exports = docsService; 