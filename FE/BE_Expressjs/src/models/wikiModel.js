const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 위키 문서 관련 데이터베이스 작업을 처리하는 모델
 */
const wikiModel = {
  /**
   * 모든 위키 문서 조회
   * @param {Object} options - 필터링 및 정렬 옵션
   * @returns {Promise<{documents: Array, total: number}>}
   */
  getAllDocuments: async (options = {}) => {
    const {
      category,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
      query
    } = options;

    const skip = (page - 1) * limit;
    const take = Number(limit);

    // 검색 조건 구성
    const where = {};
    
    // 카테고리 필터링
    if (category) {
      where.categories = {
        some: {
          slug: category
        }
      };
    }
    
    // 검색어 필터링
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } }
      ];
    }

    // 정렬 방식 설정
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    try {
      // 문서 조회 및 총 개수 병렬로 가져오기
      const [documents, total] = await Promise.all([
        prisma.wikiDocument.findMany({
          where,
          orderBy,
          skip,
          take,
          include: {
            categories: true,
            createdBy: true,
            lastModifiedBy: true
          }
        }),
        prisma.wikiDocument.count({ where })
      ]);

      return { documents, total };
    } catch (error) {
      console.error('Error in getAllDocuments:', error);
      throw error;
    }
  },

  /**
   * 인기 위키 문서 조회 (조회수 기준)
   * @param {number} limit - 가져올 문서 수
   * @returns {Promise<Array>}
   */
  getPopularDocuments: async (limit = 4) => {
    try {
      return await prisma.wikiDocument.findMany({
        where: { isPublished: true },
        orderBy: { viewCount: 'desc' },
        take: Number(limit),
        include: {
          categories: true,
          createdBy: true,
          lastModifiedBy: true
        }
      });
    } catch (error) {
      console.error('Error in getPopularDocuments:', error);
      throw error;
    }
  },

  /**
   * 최근 수정된 위키 문서 조회
   * @param {number} limit - 가져올 문서 수
   * @returns {Promise<Array>}
   */
  getRecentDocuments: async (limit = 3) => {
    try {
      return await prisma.wikiDocument.findMany({
        where: { isPublished: true },
        orderBy: { updatedAt: 'desc' },
        take: Number(limit),
        include: {
          categories: true,
          createdBy: true,
          lastModifiedBy: true
        }
      });
    } catch (error) {
      console.error('Error in getRecentDocuments:', error);
      throw error;
    }
  },

  /**
   * 특정 슬러그의 위키 문서 조회
   * @param {string} slug - 문서 슬러그
   * @returns {Promise<Object>}
   */
  getDocumentBySlug: async (slug) => {
    try {
      const document = await prisma.wikiDocument.findUnique({
        where: { slug },
        include: {
          categories: true,
          createdBy: true,
          lastModifiedBy: true
        }
      });

      if (!document) {
        return null;
      }

      // 조회수 증가
      await prisma.wikiDocument.update({
        where: { id: document.id },
        data: { viewCount: { increment: 1 } }
      });

      return document;
    } catch (error) {
      console.error(`Error in getDocumentBySlug for ${slug}:`, error);
      throw error;
    }
  },

  /**
   * 새 위키 문서 생성
   * @param {Object} documentData - 생성할 문서 정보
   * @returns {Promise<Object>}
   */
  createDocument: async (documentData) => {
    const { title, content, slug, categories, userId } = documentData;

    try {
      // 슬러그 중복 확인
      const existingDoc = await prisma.wikiDocument.findUnique({
        where: { slug }
      });

      if (existingDoc) {
        throw new Error('이미 존재하는 문서 경로입니다.');
      }

      // 카테고리 연결 데이터 준비 - 여기를 수정
      let categoryConnect = [];
      if (categories && categories.length > 0) {
        // 카테고리가 문자열 ID 배열인지 확인
        categoryConnect = categories.map(categoryId => {
          // 문자열인 경우
          if (typeof categoryId === 'string') {
            return { id: categoryId };
          }
          // 객체인 경우 (id 필드만 사용)
          else if (typeof categoryId === 'object' && categoryId !== null && categoryId.id) {
            return { id: categoryId.id };
          }
          return null;
        }).filter(Boolean); // null 제거
      }

      // 문서 생성
      const newDocument = await prisma.wikiDocument.create({
        data: {
          title,
          content,
          slug,
          isPublished: true,
          viewCount: 0,
          createdBy: { connect: { id: userId } },
          lastModifiedBy: { connect: { id: userId } },
          categories: {
            connect: categoryConnect
          }
        },
        include: {
          categories: true,
          createdBy: true,
          lastModifiedBy: true
        }
      });

      // 첫 번째 리비전 생성
      await prisma.wikiRevision.create({
        data: {
          content,
          comment: '문서 생성',
          document: { connect: { id: newDocument.id } },
          createdBy: { connect: { id: userId } }
        }
      });

      // 기여 기록 추가
      await prisma.userContribution.create({
        data: {
          type: 'WIKI',
          title: `위키 문서 "${title}" 생성`,
          document: {
            connect: { id: newDocument.id }
          },
          user: { connect: { id: userId } }
        }
      });

      return newDocument;
    } catch (error) {
      console.error('Error in createDocument:', error);
      throw error;
    }
  },

  /**
   * 위키 문서 수정
   * @param {string} slug - 수정할 문서 슬러그
   * @param {Object} updates - 변경할 내용
   * @param {string} comment - 수정 사유
   * @param {string} userId - 수정한 사용자 ID
   * @returns {Promise<Object>}
   */
  updateDocument: async (slug, updates, comment, userId) => {
    try {
      // 기존 문서 조회
      const document = await prisma.wikiDocument.findUnique({
        where: { slug },
        include: { categories: true }
      });

      if (!document) {
        throw new Error('문서를 찾을 수 없습니다.');
      }

      // 카테고리 업데이트 처리
      let categoryOperations = {};
      if (updates.categories) {
        // 기존 카테고리 연결 해제
        const existingCategoryIds = document.categories.map(cat => cat.id);
        if (existingCategoryIds.length > 0) {
          categoryOperations.disconnect = existingCategoryIds.map(id => ({ id }));
        }
        
        // 새 카테고리 연결
        if (updates.categories.length > 0) {
          categoryOperations.connect = updates.categories.map(id => ({ id }));
        }
      }

      // 문서 업데이트
      const updatedDocument = await prisma.wikiDocument.update({
        where: { id: document.id },
        data: {
          title: updates.title !== undefined ? updates.title : document.title,
          content: updates.content !== undefined ? updates.content : document.content,
          lastModifiedBy: { connect: { id: userId } },
          categories: categoryOperations
        },
        include: {
          categories: true,
          createdBy: true,
          lastModifiedBy: true
        }
      });

      // 리비전 생성
      await prisma.wikiRevision.create({
        data: {
          content: updatedDocument.content,
          comment,
          document: { connect: { id: document.id } },
          createdBy: { connect: { id: userId } }
        }
      });

      // 기여 기록 추가
      await prisma.userContribution.create({
        data: {
          type: 'WIKI',
          title: `위키 문서 "${updatedDocument.title}" 수정`,
          document: { 
            connect: { id: document.id } 
          },
          user: { connect: { id: userId } }
        }
      });

      return updatedDocument;
    } catch (error) {
      console.error(`Error in updateDocument for ${slug}:`, error);
      throw error;
    }
  },

  /**
   * 위키 문서 삭제
   * @param {string} slug - 삭제할 문서 슬러그
   * @returns {Promise<boolean>}
   */
  deleteDocument: async (slug) => {
    try {
      // 문서 조회
      const document = await prisma.wikiDocument.findUnique({
        where: { slug }
      });

      if (!document) {
        throw new Error('문서를 찾을 수 없습니다.');
      }

      // 관련 리비전 및 토론 삭제
      await Promise.all([
        prisma.wikiRevision.deleteMany({
          where: { documentId: document.id }
        }),
        prisma.wikiDiscussion.deleteMany({
          where: { documentId: document.id }
        })
      ]);

      // 문서 삭제
      await prisma.wikiDocument.delete({
        where: { id: document.id }
      });

      return true;
    } catch (error) {
      console.error(`Error in deleteDocument for ${slug}:`, error);
      throw error;
    }
  },

  /**
   * 문서 수정 이력 조회
   * @param {string} slug - 문서 슬러그
   * @returns {Promise<Array>}
   */
  getRevisions: async (slug) => {
    try {
      const document = await prisma.wikiDocument.findUnique({
        where: { slug }
      });

      if (!document) {
        throw new Error('문서를 찾을 수 없습니다.');
      }

      return await prisma.wikiRevision.findMany({
        where: { documentId: document.id },
        orderBy: { createdAt: 'desc' },
        include: { createdBy: true }
      });
    } catch (error) {
      console.error(`Error in getRevisions for ${slug}:`, error);
      throw error;
    }
  },

  /**
   * 문서 토론 목록 조회
   * @param {string} slug - 문서 슬러그
   * @returns {Promise<Array>}
   */
  getDiscussions: async (slug) => {
    try {
      const document = await prisma.wikiDocument.findUnique({
        where: { slug }
      });

      if (!document) {
        throw new Error('문서를 찾을 수 없습니다.');
      }

      return await prisma.wikiDiscussion.findMany({
        where: { documentId: document.id },
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: true,
          comments: {
            include: { createdBy: true },
            orderBy: { createdAt: 'asc' }
          }
        }
      });
    } catch (error) {
      console.error(`Error in getDiscussions for ${slug}:`, error);
      throw error;
    }
  },

  /**
   * 위키 검색
   * @param {string} query - 검색어
   * @param {Object} options - 검색 옵션
   * @returns {Promise<Array>}
   */
  search: async (query, options = {}) => {
    try {
      const documents = await prisma.wikiDocument.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } }
          ],
          isPublished: true
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          categories: true
        }
      });

      // 검색 결과 가공
      return documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        slug: doc.slug,
        excerpt: doc.content.substring(0, 100) + '...',
        categories: doc.categories,
        updatedAt: doc.updatedAt,
        relevance: 1.0 // 실제 검색 엔진에서는 관련성 점수 계산
      }));
    } catch (error) {
      console.error(`Error in search for "${query}":`, error);
      throw error;
    }
  },

  /**
   * 카테고리 목록 조회
   * @returns {Promise<Array>}
   */
  getCategories: async () => {
    try {
      return await prisma.wikiCategory.findMany({
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      console.error('Error in getCategories:', error);
      throw error;
    }
  }
};

module.exports = wikiModel; 