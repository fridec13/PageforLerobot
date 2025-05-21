const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 기술 문서 관련 데이터베이스 작업을 처리하는 모델
 */
const docsModel = {
  /**
   * 모든 문서 조회
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
      where.categoryId = category;
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
        prisma.document.findMany({
          where,
          orderBy,
          skip,
          take,
          include: {
            category: true,
            createdByUser: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            },
            lastEditedByUser: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }),
        prisma.document.count({ where })
      ]);

      return { documents, total };
    } catch (error) {
      console.error('Error in getAllDocuments:', error);
      throw error;
    }
  },

  /**
   * 경로로 문서 조회
   * @param {string} path - 문서 경로
   * @returns {Promise<Object>}
   */
  getDocumentByPath: async (path) => {
    try {
      const document = await prisma.document.findUnique({
        where: { path },
        include: {
          category: true,
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          lastEditedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      if (!document) {
        return null;
      }

      return document;
    } catch (error) {
      console.error(`Error in getDocumentByPath for ${path}:`, error);
      throw error;
    }
  },

  /**
   * ID로 문서 조회
   * @param {string} id - 문서 ID
   * @returns {Promise<Object>}
   */
  getDocumentById: async (id) => {
    try {
      const document = await prisma.document.findUnique({
        where: { id },
        include: {
          category: true,
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          lastEditedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      if (!document) {
        return null;
      }

      return document;
    } catch (error) {
      console.error(`Error in getDocumentById for ${id}:`, error);
      throw error;
    }
  },

  /**
   * 카테고리별 문서 조회
   * @param {string} categoryPath - 카테고리 경로
   * @returns {Promise<Array>}
   */
  getDocumentsByCategory: async (categoryPath) => {
    try {
      // 먼저 카테고리 조회
      const category = await prisma.category.findUnique({
        where: { path: categoryPath }
      });

      if (!category) {
        return [];
      }

      // 카테고리에 속한 문서 조회
      const documents = await prisma.document.findMany({
        where: { 
          categoryId: category.id,
          isPublished: true
        },
        include: {
          category: true,
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          lastEditedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { title: 'asc' }
      });

      return documents;
    } catch (error) {
      console.error(`Error in getDocumentsByCategory for ${categoryPath}:`, error);
      throw error;
    }
  },

  /**
   * 문서 생성
   * @param {Object} documentData - 문서 데이터
   * @returns {Promise<Object>}
   */
  createDocument: async (documentData) => {
    const { title, content, path, categoryId, userId } = documentData;

    try {
      // 경로 중복 확인
      const existingDoc = await prisma.document.findUnique({
        where: { path }
      });

      if (existingDoc) {
        throw new Error('이미 존재하는 문서 경로입니다.');
      }

      // 문서 생성
      const newDocument = await prisma.document.create({
        data: {
          title,
          content,
          path,
          isPublished: true,
          version: 1,
          category: { connect: { id: categoryId } },
          createdByUser: { connect: { id: userId } },
          lastEditedByUser: { connect: { id: userId } }
        },
        include: {
          category: true,
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          lastEditedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      // 첫 번째 이력 생성
      await prisma.documentHistory.create({
        data: {
          content,
          version: 1,
          changeDescription: '문서 생성',
          document: { connect: { id: newDocument.id } },
          editedByUser: { connect: { id: userId } }
        }
      });

      // 기여 기록 추가
      await prisma.userContribution.create({
        data: {
          type: 'DOCS',
          title: `기술문서 "${title}" 생성`,
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
   * 문서 수정
   * @param {string} id - 문서 ID
   * @param {Object} updates - 변경 내용
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>}
   */
  updateDocument: async (id, updates, userId) => {
    try {
      // 기존 문서 조회
      const document = await prisma.document.findUnique({
        where: { id }
      });

      if (!document) {
        throw new Error('문서를 찾을 수 없습니다.');
      }

      // 문서 업데이트
      const updatedDocument = await prisma.document.update({
        where: { id },
        data: {
          title: updates.title !== undefined ? updates.title : document.title,
          content: updates.content !== undefined ? updates.content : document.content,
          path: updates.path !== undefined ? updates.path : document.path,
          categoryId: updates.categoryId !== undefined ? updates.categoryId : document.categoryId,
          version: { increment: 1 },
          lastEditedByUser: { connect: { id: userId } }
        },
        include: {
          category: true,
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          lastEditedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      // 이력 생성
      await prisma.documentHistory.create({
        data: {
          content: updatedDocument.content,
          version: updatedDocument.version,
          changeDescription: updates.changeDescription || '문서 수정',
          document: { connect: { id: document.id } },
          editedByUser: { connect: { id: userId } }
        }
      });

      // 기여 기록 추가
      await prisma.userContribution.create({
        data: {
          type: 'DOCS',
          title: `기술문서 "${updatedDocument.title}" 수정`,
          document: { 
            connect: { id: document.id } 
          },
          user: { connect: { id: userId } }
        }
      });

      return updatedDocument;
    } catch (error) {
      console.error(`Error in updateDocument for ${id}:`, error);
      throw error;
    }
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
    try {
      // 문서 존재 확인
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });

      if (!document) {
        throw new Error('문서를 찾을 수 없습니다.');
      }

      // 변경 요청 생성
      const changeRequest = await prisma.documentChangeRequest.create({
        data: {
          proposedContent,
          reason,
          status: 'pending',
          document: { connect: { id: documentId } },
          proposedByUser: { connect: { id: userId } }
        },
        include: {
          document: {
            select: {
              id: true,
              title: true,
              path: true
            }
          },
          proposedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          reviewedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      return changeRequest;
    } catch (error) {
      console.error(`Error in createChangeRequest for document ${documentId}:`, error);
      throw error;
    }
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
    try {
      // 변경 요청 조회
      const request = await prisma.documentChangeRequest.findUnique({
        where: { id: requestId },
        include: { document: true }
      });

      if (!request) {
        throw new Error('변경 요청을 찾을 수 없습니다.');
      }

      if (request.status !== 'pending') {
        throw new Error('이미 검토된 요청입니다.');
      }

      // 변경 요청 업데이트
      const updatedRequest = await prisma.documentChangeRequest.update({
        where: { id: requestId },
        data: {
          status,
          reviewComment,
          reviewedAt: new Date(),
          reviewedByUser: { connect: { id: reviewerId } }
        },
        include: {
          document: {
            select: {
              id: true,
              title: true,
              path: true,
              version: true
            }
          },
          proposedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          reviewedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      // 승인된 경우 문서 업데이트
      if (status === 'approved') {
        // 문서 버전 업데이트
        const updatedDocument = await prisma.document.update({
          where: { id: request.documentId },
          data: {
            content: request.proposedContent,
            version: { increment: 1 },
            lastEditedByUser: { connect: { id: request.proposedByUserId } }
          }
        });

        // 이력 생성
        await prisma.documentHistory.create({
          data: {
            content: updatedDocument.content,
            version: updatedDocument.version,
            changeDescription: '변경 요청 승인',
            document: { connect: { id: updatedDocument.id } },
            editedByUser: { connect: { id: request.proposedByUserId } }
          }
        });

        // 기여 기록 추가
        await prisma.userContribution.create({
          data: {
            type: 'DOCS',
            title: `기술문서 "${updatedDocument.title}" 변경 요청 승인`,
            document: { 
              connect: { id: updatedDocument.id } 
            },
            user: { connect: { id: request.proposedByUserId } }
          }
        });
      }

      return updatedRequest;
    } catch (error) {
      console.error(`Error in reviewChangeRequest for ${requestId}:`, error);
      throw error;
    }
  },

  /**
   * 문서 이력 조회
   * @param {string} documentId - 문서 ID
   * @returns {Promise<Array>}
   */
  getDocumentHistory: async (documentId) => {
    try {
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });

      if (!document) {
        throw new Error('문서를 찾을 수 없습니다.');
      }

      return await prisma.documentHistory.findMany({
        where: { documentId },
        orderBy: { version: 'desc' },
        include: {
          editedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });
    } catch (error) {
      console.error(`Error in getDocumentHistory for ${documentId}:`, error);
      throw error;
    }
  },

  /**
   * 변경 요청 목록 조회
   * @param {string} status - 상태 필터 (optional)
   * @returns {Promise<Array>}
   */
  getChangeRequests: async (status) => {
    try {
      const where = {};
      if (status) {
        where.status = status;
      }

      return await prisma.documentChangeRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          document: {
            select: {
              id: true,
              title: true,
              path: true
            }
          },
          proposedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          reviewedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error in getChangeRequests:', error);
      throw error;
    }
  },

  /**
   * 변경 요청 상세 조회
   * @param {string} requestId - 요청 ID
   * @returns {Promise<Object>}
   */
  getChangeRequestById: async (requestId) => {
    try {
      return await prisma.documentChangeRequest.findUnique({
        where: { id: requestId },
        include: {
          document: {
            select: {
              id: true,
              title: true,
              content: true,
              path: true,
              version: true
            }
          },
          proposedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          reviewedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });
    } catch (error) {
      console.error(`Error in getChangeRequestById for ${requestId}:`, error);
      throw error;
    }
  },

  /**
   * 모든 카테고리 조회
   * @returns {Promise<Array>}
   */
  getAllCategories: async () => {
    try {
      return await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              path: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error in getAllCategories:', error);
      throw error;
    }
  },

  /**
   * 문서 삭제
   * @param {string} id - 문서 ID
   * @returns {Promise<boolean>}
   */
  deleteDocument: async (id) => {
    try {
      // 문서 존재 확인
      const document = await prisma.document.findUnique({
        where: { id }
      });

      if (!document) {
        return false;
      }

      // 관련 이력 및 변경 요청은 cascade로 자동 삭제됨
      await prisma.document.delete({
        where: { id }
      });

      return true;
    } catch (error) {
      console.error(`Error in deleteDocument for ${id}:`, error);
      throw error;
    }
  },

  /**
   * 문서 발행 상태 변경
   * @param {string} id - 문서 ID
   * @param {boolean} isPublished - 발행 상태
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>}
   */
  togglePublishStatus: async (id, isPublished, userId) => {
    try {
      // 문서 존재 확인
      const document = await prisma.document.findUnique({
        where: { id }
      });

      if (!document) {
        return null;
      }

      // 문서 상태 업데이트
      return await prisma.document.update({
        where: { id },
        data: {
          isPublished,
          lastEditedByUser: { connect: { id: userId } }
        },
        include: {
          category: true,
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          lastEditedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });
    } catch (error) {
      console.error(`Error in togglePublishStatus for ${id}:`, error);
      throw error;
    }
  },

  /**
   * 인기 문서 목록 조회
   * @param {number} limit - 조회할 문서 수
   * @returns {Promise<Array>}
   */
  getPopularDocuments: async (limit = 10) => {
    try {
      return await prisma.document.findMany({
        where: { isPublished: true },
        orderBy: { views: 'desc' },
        take: Number(limit),
        include: {
          category: true,
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          lastEditedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });
    } catch (error) {
      console.error(`Error in getPopularDocuments:`, error);
      throw error;
    }
  },

  /**
   * 최신 문서 목록 조회
   * @param {number} limit - 조회할 문서 수
   * @returns {Promise<Array>}
   */
  getRecentDocuments: async (limit = 10) => {
    try {
      return await prisma.document.findMany({
        where: { isPublished: true },
        orderBy: { updatedAt: 'desc' },
        take: Number(limit),
        include: {
          category: true,
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          lastEditedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });
    } catch (error) {
      console.error(`Error in getRecentDocuments:`, error);
      throw error;
    }
  },

  /**
   * 문서 검색
   * @param {string} query - 검색어
   * @returns {Promise<Array>}
   */
  searchDocuments: async (query) => {
    try {
      return await prisma.document.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } }
          ]
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          category: true,
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          lastEditedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });
    } catch (error) {
      console.error(`Error in searchDocuments for query "${query}":`, error);
      throw error;
    }
  },

  /**
   * 문서별 변경 요청 목록 조회
   * @param {string} documentId - 문서 ID
   * @returns {Promise<Array>}
   */
  getChangeRequestsByDocument: async (documentId) => {
    try {
      return await prisma.documentChangeRequest.findMany({
        where: { documentId },
        orderBy: { createdAt: 'desc' },
        include: {
          proposedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          reviewedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });
    } catch (error) {
      console.error(`Error in getChangeRequestsByDocument for ${documentId}:`, error);
      throw error;
    }
  },

  /**
   * 카테고리 생성
   * @param {Object} categoryData - 카테고리 데이터 
   * @returns {Promise<Object>}
   */
  createCategory: async (categoryData) => {
    try {
      // 경로 중복 확인
      const existingCategory = await prisma.category.findUnique({
        where: { path: categoryData.path }
      });

      if (existingCategory) {
        throw new Error('이미 존재하는 카테고리 경로입니다.');
      }

      // 상위 카테고리 처리
      const data = { ...categoryData };
      
      // parentId가 있으면 연결
      if (data.parentId) {
        data.parent = { connect: { id: data.parentId } };
        delete data.parentId;
      }

      return await prisma.category.create({
        data,
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              path: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error in createCategory:', error);
      throw error;
    }
  },

  /**
   * 카테고리 수정
   * @param {string} id - 카테고리 ID
   * @param {Object} categoryData - 수정할 카테고리 데이터
   * @returns {Promise<Object>}
   */
  updateCategory: async (id, categoryData) => {
    try {
      // 카테고리 존재 확인
      const category = await prisma.category.findUnique({
        where: { id }
      });

      if (!category) {
        return null;
      }

      // 경로 변경 시 중복 확인
      if (categoryData.path && categoryData.path !== category.path) {
        const existingCategory = await prisma.category.findUnique({
          where: { path: categoryData.path }
        });

        if (existingCategory && existingCategory.id !== id) {
          throw new Error('이미 존재하는 카테고리 경로입니다.');
        }
      }

      // 상위 카테고리 처리
      const data = { ...categoryData };
      
      // parentId가 있으면 연결
      if (data.parentId) {
        data.parent = { connect: { id: data.parentId } };
        delete data.parentId;
      }

      return await prisma.category.update({
        where: { id },
        data,
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              path: true
            }
          }
        }
      });
    } catch (error) {
      console.error(`Error in updateCategory for ${id}:`, error);
      throw error;
    }
  },

  /**
   * 카테고리 삭제
   * @param {string} id - 카테고리 ID
   * @returns {Promise<boolean>}
   */
  deleteCategory: async (id) => {
    try {
      // 카테고리 존재 확인
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          documents: true,
          children: true
        }
      });

      if (!category) {
        return false;
      }

      // 문서가 있거나 하위 카테고리가 있으면 삭제 불가
      if (category.documents.length > 0 || category.children.length > 0) {
        throw new Error('문서나 하위 카테고리가 있는 카테고리는 삭제할 수 없습니다.');
      }

      await prisma.category.delete({
        where: { id }
      });

      return true;
    } catch (error) {
      console.error(`Error in deleteCategory for ${id}:`, error);
      throw error;
    }
  }
};

module.exports = docsModel; 