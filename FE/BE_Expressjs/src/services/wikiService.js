const wikiModel = require('../models/wikiModel');

/**
 * 위키 문서 관련 비즈니스 로직을 처리하는 서비스
 */
const wikiService = {
  /**
   * 위키 문서 목록 조회
   * @param {Object} options - 필터링 및 정렬 옵션
   * @returns {Promise<{documents: Array, total: number}>}
   */
  getDocuments: async (options) => {
    return await wikiModel.getAllDocuments(options);
  },
  
  /**
   * 인기 위키 문서 조회
   * @param {number} limit - 가져올 문서 수
   * @returns {Promise<Array>}
   */
  getPopularDocuments: async (limit) => {
    return await wikiModel.getPopularDocuments(limit);
  },
  
  /**
   * 최근 수정된 위키 문서 조회
   * @param {number} limit - 가져올 문서 수
   * @returns {Promise<Array>}
   */
  getRecentDocuments: async (limit) => {
    return await wikiModel.getRecentDocuments(limit);
  },
  
  /**
   * 특정 슬러그의 위키 문서 조회
   * @param {string} slug - 문서 슬러그
   * @returns {Promise<Object>}
   */
  getDocumentBySlug: async (slug) => {
    const document = await wikiModel.getDocumentBySlug(slug);
    if (!document) {
      const error = new Error('문서를 찾을 수 없습니다.');
      error.statusCode = 404;
      throw error;
    }
    return document;
  },
  
  /**
   * 새 위키 문서 생성
   * @param {Object} documentData - 생성할 문서 정보
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>}
   */
  createDocument: async (documentData, userId) => {
    // 필수 필드 검증
    if (!documentData.title || !documentData.content || !documentData.slug) {
      const error = new Error('제목, 내용, 슬러그는 필수 입력 항목입니다.');
      error.statusCode = 400;
      throw error;
    }
    
    // 슬러그 형식 검증 (영문, 숫자, 하이픈, URL 인코딩된 한글 허용)
    const slugRegex = /^[a-z0-9-]+$|^%[0-9A-F]{2}(%[0-9A-F]{2})*$/i;
    if (!slugRegex.test(documentData.slug)) {
      const error = new Error('슬러그는 영문 소문자, 숫자, 하이픈 또는 URL 인코딩된 한글만 포함할 수 있습니다.');
      error.statusCode = 400;
      throw error;
    }
    
    return await wikiModel.createDocument({
      ...documentData,
      userId
    });
  },
  
  /**
   * 위키 문서 수정
   * @param {string} slug - 수정할 문서 슬러그
   * @param {Object} updates - 변경할 내용
   * @param {string} comment - 수정 사유
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>}
   */
  updateDocument: async (slug, updates, comment, userId) => {
    // 수정 사유 필수 입력
    if (!comment) {
      const error = new Error('수정 사유는 필수 입력 항목입니다.');
      error.statusCode = 400;
      throw error;
    }
    
    return await wikiModel.updateDocument(slug, updates, comment, userId);
  },
  
  /**
   * 위키 문서 삭제
   * @param {string} slug - 삭제할 문서 슬러그
   * @returns {Promise<boolean>}
   */
  deleteDocument: async (slug) => {
    return await wikiModel.deleteDocument(slug);
  },
  
  /**
   * 문서 수정 이력 조회
   * @param {string} slug - 문서 슬러그
   * @returns {Promise<Array>}
   */
  getRevisions: async (slug) => {
    return await wikiModel.getRevisions(slug);
  },
  
  /**
   * 문서 토론 목록 조회
   * @param {string} slug - 문서 슬러그
   * @returns {Promise<Array>}
   */
  getDiscussions: async (slug) => {
    return await wikiModel.getDiscussions(slug);
  },
  
  /**
   * 위키 검색
   * @param {string} query - 검색어
   * @param {Object} options - 검색 옵션
   * @returns {Promise<Array>}
   */
  search: async (query, options) => {
    if (!query || query.trim().length === 0) {
      const error = new Error('검색어를 입력해주세요.');
      error.statusCode = 400;
      throw error;
    }
    
    return await wikiModel.search(query, options);
  },
  
  /**
   * 카테고리 목록 조회
   * @returns {Promise<Array>}
   */
  getCategories: async () => {
    return await wikiModel.getCategories();
  }
};

module.exports = wikiService; 