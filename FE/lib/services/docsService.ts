// services/docsService.ts

import axios from 'axios';

// 타입 정의
export interface Document {
  id: string;
  title: string;
  content: string;
  path: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastEditedBy: string;
  isPublished: boolean;
  version: number;
  views?: number;
  tags?: string[];
}

export interface DocumentHistory {
  id: string;
  documentId: string;
  content: string;
  version: number;
  editedBy: string;
  editedAt: Date;
  changeDescription: string;
}

export interface Category {
  id: string;
  name: string;
  path: string;
  description: string;
  parentId?: string;
  icon?: string;
}

export interface DocumentChangeRequest {
  id: string;
  documentId: string;
  proposedContent: string;
  proposedBy: string;
  status: RequestStatus;
  createdAt: Date;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  reviewComment: string | null;
  reason?: string;
}

export type RequestStatus = 'pending' | 'approved' | 'rejected';

// API URL 설정
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// API 클라이언트 설정
const apiClient = axios.create({
  baseURL: `${API_URL}/docs`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 설정
apiClient.interceptors.request.use(
  (config) => {
    try {
      // 클라이언트 사이드에서만 localStorage에 접근
      let token = null;
      if (typeof window !== 'undefined') {
        // auth-storage에서 토큰 추출
        const authData = localStorage.getItem('auth-storage');
        if (authData) {
          const parsedData = JSON.parse(authData);
          token = parsedData?.state?.token;
        } else {
          token = localStorage.getItem('token');
        }
      }
      
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('토큰 설정 중 오류 발생:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('API 요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// Mock 데이터 (API 실패 시 폴백)
const documentsData: Document[] = [
  {
    id: 'doc_1',
    title: 'RoboDK 소개',
    content: '# RoboDK 소개\n\nRoboDK는 로봇 시뮬레이션 및 프로그래밍을 위한 소프트웨어입니다...',
    path: 'robodk/introduction',
    categoryId: 'cat_robodk',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
    createdBy: 'user_admin',
    lastEditedBy: 'user_admin',
    isPublished: true,
    version: 1,
    views: 1245
  },
  {
    id: 'doc_2',
    title: 'RoboDK 설치 가이드',
    content: '# RoboDK 설치 가이드\n\n이 가이드는 RoboDK를 설치하는 단계별 절차를 설명합니다...',
    path: 'robodk/installation',
    categoryId: 'cat_robodk',
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-02-12'),
    createdBy: 'user_admin',
    lastEditedBy: 'user_editor',
    isPublished: true,
    version: 2,
    views: 785
  },
  {
    id: 'doc_3',
    title: 'Onshape 기초',
    content: '# Onshape 기초\n\nOnshape의 기본 기능과 인터페이스에 대해 설명합니다...',
    path: 'onshape/basics',
    categoryId: 'cat_onshape',
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date('2023-03-05'),
    createdBy: 'user_editor',
    lastEditedBy: 'user_editor',
    isPublished: true,
    version: 3,
    views: 756
  },
  {
    id: 'doc_4',
    title: 'ROS2 설치 가이드',
    content: '# ROS2 설치 가이드\n\n이 가이드는 ROS2를 설치하는 방법을 설명합니다...',
    path: 'ros2/installation',
    categoryId: 'cat_ros2',
    createdAt: new Date('2023-03-05'),
    updatedAt: new Date('2023-03-05'),
    createdBy: 'user_admin',
    lastEditedBy: 'user_admin',
    isPublished: true,
    version: 1,
    views: 985
  },
  {
    id: 'doc_5',
    title: 'RoboDK API 레퍼런스',
    content: '# RoboDK API 레퍼런스\n\nRoboDK의 API 사용 방법에 대해 설명합니다...',
    path: 'robodk/api',
    categoryId: 'cat_robodk',
    createdAt: new Date('2023-04-10'),
    updatedAt: new Date('2023-04-10'),
    createdBy: 'user_admin',
    lastEditedBy: 'user_admin',
    isPublished: true,
    version: 1,
    views: 685
  },
  {
    id: 'doc_8',
    title: 'CAD 모델링 가이드',
    content: '# CAD 모델링 가이드\n\nOnshape에서 효율적인 CAD 모델링 방법을 설명합니다...',
    path: 'onshape/modeling',
    categoryId: 'cat_onshape',
    createdAt: new Date('2023-05-12'),
    updatedAt: new Date('2023-05-12'),
    createdBy: 'user_editor',
    lastEditedBy: 'user_editor',
    isPublished: true,
    version: 1,
    views: 489
  },
  {
    id: 'doc_9',
    title: 'ROS2 노드 생성',
    content: '# ROS2 노드 생성\n\nROS2에서 노드를 생성하고 활용하는 방법을 설명합니다...',
    path: 'ros2/nodes',
    categoryId: 'cat_ros2',
    createdAt: new Date('2023-06-05'),
    updatedAt: new Date('2023-06-05'),
    createdBy: 'user_admin',
    lastEditedBy: 'user_admin',
    isPublished: true,
    version: 1,
    views: 542
  },
  {
    id: 'doc_10',
    title: 'LeRobot 프로그래밍 기초',
    content: '# LeRobot 프로그래밍 기초\n\nLeRobot의 프로그래밍 방법에 대해 설명합니다...',
    path: 'lerobot/programming',
    categoryId: 'cat_lerobot',
    createdAt: new Date('2023-04-15'),
    updatedAt: new Date('2023-04-15'),
    createdBy: 'user_editor',
    lastEditedBy: 'user_editor',
    isPublished: true,
    version: 1,
    views: 312
  }
];

const categoriesData: Category[] = [
  {
    id: 'cat_robodk',
    name: 'RoboDK',
    path: 'robodk',
    description: '산업용 로봇 시뮬레이션 및 프로그래밍 소프트웨어',
    icon: 'cpu'
  },
  {
    id: 'cat_onshape',
    name: 'Onshape',
    path: 'onshape',
    description: '클라우드 기반 3D CAD 설계 도구',
    icon: 'layers'
  },
  {
    id: 'cat_ros2',
    name: 'ROS2',
    path: 'ros2',
    description: '로봇 운영체제 프레임워크',
    icon: 'code-2'
  },
  {
    id: 'cat_lerobot',
    name: 'LeRobot',
    path: 'lerobot',
    description: '교육용 로봇 프로그래밍 플랫폼',
    icon: 'book-open'
  }
];

const historyData: DocumentHistory[] = [];
const changeRequestsData: DocumentChangeRequest[] = [];

/**
 * 문서 서비스
 */
const docsService = {
  /**
   * 문서 조회
   * @param path - 문서 경로
   * @returns 조회된 문서 또는 null
   */
  getDocumentByPath: async (path: string): Promise<Document | null> => {
    try {
      const response = await apiClient.get(`/path/${path}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error in getDocumentByPath for ${path}:`, error);
      return documentsData.find(doc => doc.path === path && doc.isPublished) || null;
    }
  },

  /**
   * 문서 ID로 조회
   * @param id - 문서 ID
   * @returns 조회된 문서 또는 null
   */
  getDocumentById: async (id: string): Promise<Document | null> => {
    try {
      const response = await apiClient.get(`/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error in getDocumentById for ${id}:`, error);
      return documentsData.find(doc => doc.id === id) || null;
    }
  },

  /**
   * 카테고리별 문서 목록 조회
   * @param categoryPath - 카테고리 경로
   * @returns 문서 목록
   */
  getDocumentsByCategory: async (categoryPath: string): Promise<Document[]> => {
    try {
      const response = await apiClient.get(`/category/${categoryPath}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error in getDocumentsByCategory for ${categoryPath}:`, error);
      const category = categoriesData.find(cat => cat.path === categoryPath);
      if (!category) return [];
      return documentsData.filter(doc => doc.categoryId === category.id && doc.isPublished);
    }
  },

  /**
   * 모든 문서 목록 조회
   * @returns 문서 목록
   */
  getAllDocuments: async (): Promise<Document[]> => {
    try {
      const response = await apiClient.get('/');
      return response.data.data;
    } catch (error) {
      console.error('Error in getAllDocuments:', error);
      return documentsData.filter(doc => doc.isPublished);
    }
  },

  /**
   * 인기 문서 목록 조회
   * @param limit - 조회할 문서 수
   * @returns 인기 문서 목록
   */
  getPopularDocuments: async (limit: number = 10): Promise<Document[]> => {
    try {
      const response = await apiClient.get('/popular', { params: { limit } });
      return response.data.data;
    } catch (error) {
      console.error('Error in getPopularDocuments:', error);
      return documentsData
        .filter(doc => doc.isPublished)
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, limit);
    }
  },

  /**
   * 최신 문서 목록 조회
   * @param limit - 조회할 문서 수
   * @returns 최신 문서 목록
   */
  getRecentDocuments: async (limit: number = 10): Promise<Document[]> => {
    try {
      const response = await apiClient.get('/recent', { params: { limit } });
      return response.data.data;
    } catch (error) {
      console.error('Error in getRecentDocuments:', error);
      return documentsData
        .filter(doc => doc.isPublished)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, limit);
    }
  },

  /**
   * 문서 생성
   * @param documentData - 문서 데이터
   * @param userId - 작성자 ID
   * @returns 생성된 문서
   */
  createDocument: async (
    documentData: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastEditedBy' | 'isPublished' | 'version'>, 
    userId: string
  ): Promise<Document> => {
    try {
      const response = await apiClient.post('/', { ...documentData, userId });
      return response.data.data;
    } catch (error) {
      console.error('Error in createDocument:', error);
      // Mock 응답 (실제 환경에서는 제거)
      const newDocument: Document = {
        id: `doc_${Date.now()}`,
        ...documentData,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        lastEditedBy: userId,
        isPublished: false,
        version: 1
      };
      documentsData.push(newDocument);
      return newDocument;
    }
  },

  /**
   * 문서 수정
   * @param id - 문서 ID
   * @param documentData - 수정할 문서 데이터
   * @param userId - 수정자 ID
   * @returns 수정된 문서
   */
  updateDocument: async (
    id: string,
    documentData: Partial<Document>,
    userId: string
  ): Promise<Document | null> => {
    try {
      const response = await apiClient.put(`/${id}`, { ...documentData, userId });
      return response.data.data;
    } catch (error) {
      console.error(`Error in updateDocument for ${id}:`, error);
      // Mock 응답 (실제 환경에서는 제거)
      const documentIndex = documentsData.findIndex(doc => doc.id === id);
      if (documentIndex === -1) return null;
      
      const document = documentsData[documentIndex];
      
      // 현재 문서 상태를 이력으로 저장
      const history: DocumentHistory = {
        id: `hist_${Date.now()}`,
        documentId: document.id,
        content: document.content,
        version: document.version,
        editedBy: document.lastEditedBy,
        editedAt: document.updatedAt,
        changeDescription: '이전 버전'
      };
      historyData.push(history);
      
      // 문서 업데이트
      const updatedDocument: Document = {
        ...document,
        ...documentData,
        updatedAt: new Date(),
        lastEditedBy: userId,
        version: document.version + 1
      };
      
      documentsData[documentIndex] = updatedDocument;
      return updatedDocument;
    }
  },

  /**
   * 문서 삭제
   * @param id - 문서 ID
   * @returns 성공 여부
   */
  deleteDocument: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/${id}`);
      return true;
    } catch (error) {
      console.error(`Error in deleteDocument for ${id}:`, error);
      // Mock 응답 (실제 환경에서는 제거)
      const documentIndex = documentsData.findIndex(doc => doc.id === id);
      if (documentIndex === -1) return false;
      documentsData.splice(documentIndex, 1);
      return true;
    }
  },

  /**
   * 문서 발행 상태 변경
   * @param id - 문서 ID
   * @param isPublished - 발행 여부
   * @param userId - 사용자 ID
   * @returns 수정된 문서
   */
  togglePublishStatus: async (
    id: string,
    isPublished: boolean,
    userId: string
  ): Promise<Document | null> => {
    try {
      const response = await apiClient.put(`/${id}/publish`, { isPublished, userId });
      return response.data.data;
    } catch (error) {
      console.error(`Error in togglePublishStatus for ${id}:`, error);
      // Mock 응답 (실제 환경에서는 제거)
      const documentIndex = documentsData.findIndex(doc => doc.id === id);
      if (documentIndex === -1) return null;
      
      const document = documentsData[documentIndex];
      const updatedDocument: Document = {
        ...document,
        isPublished,
        updatedAt: new Date(),
        lastEditedBy: userId
      };
      
      documentsData[documentIndex] = updatedDocument;
      return updatedDocument;
    }
  },

  /**
   * 문서 수정 요청 생성
   * @param documentId - 문서 ID
   * @param proposedContent - 제안된 내용
   * @param reason - 변경 이유
   * @param userId - 요청자 ID
   * @returns 생성된 변경 요청
   */
  createChangeRequest: async (
    documentId: string, 
    proposedContent: string,
    reason: string,
    userId: string
  ): Promise<DocumentChangeRequest> => {
    try {
      const response = await apiClient.post(`/${documentId}/change-requests`, {
        proposedContent,
        reason,
        userId
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error in createChangeRequest for document ${documentId}:`, error);
      // Mock 응답 (실제 환경에서는 제거)
      const newRequest: DocumentChangeRequest = {
        id: `req_${Date.now()}`,
        documentId,
        proposedContent,
        proposedBy: userId,
        status: 'pending',
        createdAt: new Date(),
        reviewedBy: null,
        reviewedAt: null,
        reviewComment: null,
        reason
      };
      
      changeRequestsData.push(newRequest);
      return newRequest;
    }
  },

  /**
   * 변경 요청 검토
   * @param requestId - 변경 요청 ID
   * @param status - 검토 결과 (approved/rejected)
   * @param reviewComment - 검토 코멘트
   * @param reviewerId - 검토자 ID
   * @returns 업데이트된 변경 요청
   */
  reviewChangeRequest: async (
    requestId: string, 
    status: RequestStatus, 
    reviewComment: string, 
    reviewerId: string
  ): Promise<DocumentChangeRequest> => {
    try {
      const response = await apiClient.put(`/change-requests/${requestId}`, {
        status,
        reviewComment,
        userId: reviewerId
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error in reviewChangeRequest for ${requestId}:`, error);
      // Mock 응답 (실제 환경에서는 제거)
      const requestIndex = changeRequestsData.findIndex(req => req.id === requestId);
      if (requestIndex === -1) throw new Error('변경 요청을 찾을 수 없습니다.');
      
      const request = changeRequestsData[requestIndex];
      
      const updatedRequest: DocumentChangeRequest = {
        ...request,
        status,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewComment
      };
      
      changeRequestsData[requestIndex] = updatedRequest;
      
      // 승인된 경우 문서 업데이트
      if (status === 'approved') {
        const documentIndex = documentsData.findIndex(doc => doc.id === request.documentId);
        if (documentIndex !== -1) {
          const document = documentsData[documentIndex];
          
          // 문서 이력 저장
          const history: DocumentHistory = {
            id: `hist_${Date.now()}`,
            documentId: document.id,
            content: document.content,
            version: document.version,
            editedBy: document.lastEditedBy,
            editedAt: document.updatedAt,
            changeDescription: '사용자 제안 반영'
          };
          historyData.push(history);
          
          // 문서 업데이트
          const updatedDocument: Document = {
            ...document,
            content: request.proposedContent,
            lastEditedBy: reviewerId,
            updatedAt: new Date(),
            version: document.version + 1
          };
          
          documentsData[documentIndex] = updatedDocument;
        }
      }
      
      return updatedRequest;
    }
  },

  /**
   * 문서 이력 조회
   * @param documentId - 문서 ID
   * @returns 문서 이력 목록
   */
  getDocumentHistory: async (documentId: string): Promise<DocumentHistory[]> => {
    try {
      const response = await apiClient.get(`/${documentId}/history`);
      return response.data.data;
    } catch (error) {
      console.error(`Error in getDocumentHistory for ${documentId}:`, error);
      return historyData
        .filter(history => history.documentId === documentId)
        .sort((a, b) => b.version - a.version);
    }
  },

  /**
   * 변경 요청 목록 조회
   * @param status - 변경 요청 상태 (선택적)
   * @returns 변경 요청 목록
   */
  getChangeRequests: async (status?: RequestStatus): Promise<DocumentChangeRequest[]> => {
    try {
      const response = await apiClient.get('/change-requests', { params: { status } });
      return response.data.data;
    } catch (error) {
      console.error('Error in getChangeRequests:', error);
      if (status) {
        return changeRequestsData.filter(req => req.status === status);
      }
      return [...changeRequestsData];
    }
  },

  /**
   * 문서별 변경 요청 목록 조회
   * @param documentId - 문서 ID
   * @returns 변경 요청 목록
   */
  getChangeRequestsByDocument: async (documentId: string): Promise<DocumentChangeRequest[]> => {
    try {
      const response = await apiClient.get(`/${documentId}/change-requests`);
      return response.data.data;
    } catch (error) {
      console.error(`Error in getChangeRequestsByDocument for ${documentId}:`, error);
      return changeRequestsData.filter(req => req.documentId === documentId);
    }
  },

  /**
   * 변경 요청 상세 조회
   * @param requestId - 변경 요청 ID
   * @returns 변경 요청 또는 null
   */
  getChangeRequestById: async (requestId: string): Promise<DocumentChangeRequest | null> => {
    try {
      const response = await apiClient.get(`/change-requests/${requestId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error in getChangeRequestById for ${requestId}:`, error);
      return changeRequestsData.find(req => req.id === requestId) || null;
    }
  },

  /**
   * 모든 카테고리 조회
   * @returns 카테고리 목록
   */
  getAllCategories: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get('/categories');
      return response.data.data;
    } catch (error) {
      console.error('Error in getAllCategories:', error);
      return [...categoriesData];
    }
  },
  
  /**
   * 카테고리 ID로 조회
   * @param id - 카테고리 ID
   * @returns 조회된 카테고리 또는 null
   */
  getCategoryById: async (id: string): Promise<Category | null> => {
    try {
      const response = await apiClient.get(`/categories/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error in getCategoryById for ${id}:`, error);
      return categoriesData.find(cat => cat.id === id) || null;
    }
  },
  
  /**
   * 카테고리 생성
   * @param categoryData - 카테고리 데이터
   * @returns 생성된 카테고리
   */
  createCategory: async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
    try {
      const response = await apiClient.post('/categories', categoryData);
      return response.data.data;
    } catch (error) {
      console.error('Error in createCategory:', error);
      const newCategory: Category = {
        id: `cat_${Date.now()}`,
        ...categoryData
      };
      categoriesData.push(newCategory);
      return newCategory;
    }
  },
  
  /**
   * 카테고리 수정
   * @param id - 카테고리 ID
   * @param categoryData - 수정할 카테고리 데이터
   * @returns 수정된 카테고리
   */
  updateCategory: async (id: string, categoryData: Partial<Category>): Promise<Category | null> => {
    try {
      const response = await apiClient.put(`/categories/${id}`, categoryData);
      return response.data.data;
    } catch (error) {
      console.error(`Error in updateCategory for ${id}:`, error);
      const categoryIndex = categoriesData.findIndex(cat => cat.id === id);
      if (categoryIndex === -1) return null;
      
      const updatedCategory: Category = {
        ...categoriesData[categoryIndex],
        ...categoryData
      };
      
      categoriesData[categoryIndex] = updatedCategory;
      return updatedCategory;
    }
  },
  
  /**
   * 카테고리 삭제
   * @param id - 카테고리 ID
   * @returns 성공 여부
   */
  deleteCategory: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/categories/${id}`);
      return true;
    } catch (error) {
      console.error(`Error in deleteCategory for ${id}:`, error);
      const categoryIndex = categoriesData.findIndex(cat => cat.id === id);
      if (categoryIndex === -1) return false;
      categoriesData.splice(categoryIndex, 1);
      return true;
    }
  },
  
  /**
   * 문서 검색
   * @param query - 검색어
   * @returns 검색 결과 문서 목록
   */
  searchDocuments: async (query: string): Promise<Document[]> => {
    try {
      const response = await apiClient.get('/search', { params: { query } });
      return response.data.data;
    } catch (error) {
      console.error(`Error in searchDocuments for query "${query}":`, error);
      if (!query) return [];
      
      const lowerQuery = query.toLowerCase();
      return documentsData.filter(doc => 
        doc.isPublished && (
          doc.title.toLowerCase().includes(lowerQuery) || 
          doc.content.toLowerCase().includes(lowerQuery)
        )
      );
    }
  }
};

export default docsService;
