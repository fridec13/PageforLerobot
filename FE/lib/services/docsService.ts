// services/docsService.ts

import axios from 'axios';
import { Document, DocumentHistory, Category, DocumentChangeRequest, RequestStatus } from '../models/docs';

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
        // 직접 auth-storage에서 토큰 추출 시도
        const authData = localStorage.getItem('auth-storage');
        if (authData) {
          const parsedData = JSON.parse(authData);
          token = parsedData?.state?.token;
        } else {
          // 기존 방식으로 시도
          token = localStorage.getItem('token');
        }
      }
      
      if (token) {
        // Bearer 접두사 추가
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

// Mock 데이터
const documents: Document[] = [
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
    version: 1
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
    version: 2
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
    version: 3
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
    version: 1
  },
  {
    id: 'doc_5',
    title: 'LeRobot 프로그래밍 가이드',
    content: '# LeRobot 프로그래밍 가이드\n\nLeRobot의 프로그래밍 방법에 대해 설명합니다...',
    path: 'lerobot/programming',
    categoryId: 'cat_lerobot',
    createdAt: new Date('2023-04-15'),
    updatedAt: new Date('2023-04-15'),
    createdBy: 'user_editor',
    lastEditedBy: 'user_editor',
    isPublished: true,
    version: 1
  }
];

const categories: Category[] = [
  {
    id: 'cat_robodk',
    name: 'RoboDK',
    path: 'robodk',
    description: 'RoboDK 관련 문서'
  },
  {
    id: 'cat_onshape',
    name: 'Onshape',
    path: 'onshape',
    description: 'Onshape 관련 문서'
  },
  {
    id: 'cat_ros2',
    name: 'ROS2',
    path: 'ros2',
    description: 'ROS2 관련 문서'
  },
  {
    id: 'cat_lerobot',
    name: 'LeRobot',
    path: 'lerobot',
    description: 'LeRobot 관련 문서'
  }
];

const documentHistories: DocumentHistory[] = [];
const changeRequests: DocumentChangeRequest[] = [];

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
      // API 실패시 Mock 데이터 사용
      return documents.find(doc => doc.path === path && doc.isPublished) || null;
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
      // API 실패시 Mock 데이터 사용
      return documents.find(doc => doc.id === id) || null;
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
      // API 실패시 Mock 데이터 사용
      const category = categories.find(cat => cat.path === categoryPath);
      if (!category) return [];
      
      return documents.filter(doc => 
        doc.categoryId === category.id && doc.isPublished
      );
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
      // API 실패시 Mock 데이터 사용
      return documents.filter(doc => doc.isPublished);
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
      // API 실패시 Mock 데이터로 처리 (실제 환경에서는 제거)
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
      
      documents.push(newDocument);
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
      // API 실패시 Mock 데이터로 처리 (실제 환경에서는 제거)
      const documentIndex = documents.findIndex(doc => doc.id === id);
      
      if (documentIndex === -1) return null;
      
      const document = documents[documentIndex];
      
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
      documentHistories.push(history);
      
      // 문서 업데이트
      const updatedDocument: Document = {
        ...document,
        ...documentData,
        updatedAt: new Date(),
        lastEditedBy: userId,
        version: document.version + 1
      };
      
      documents[documentIndex] = updatedDocument;
      return updatedDocument;
    }
  },

  /**
   * 문서 수정 요청 생성
   * @param documentId - 문서 ID
   * @param proposedContent - 제안된 내용
   * @param userId - 요청자 ID
   * @returns 생성된 변경 요청
   */
  createChangeRequest: async (
    documentId: string, 
    proposedContent: string, 
    userId: string
  ): Promise<DocumentChangeRequest> => {
    try {
      const response = await apiClient.post(`/${documentId}/change-requests`, {
        proposedContent,
        userId
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error in createChangeRequest for document ${documentId}:`, error);
      // API 실패시 Mock 데이터로 처리 (실제 환경에서는 제거)
      const newRequest: DocumentChangeRequest = {
        id: `req_${Date.now()}`,
        documentId,
        proposedContent,
        proposedBy: userId,
        status: 'pending',
        createdAt: new Date(),
        reviewedBy: null,
        reviewedAt: null,
        reviewComment: null
      };
      
      changeRequests.push(newRequest);
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
      // API 실패시 Mock 데이터로 처리 (실제 환경에서는 제거)
      const requestIndex = changeRequests.findIndex(req => req.id === requestId);
      if (requestIndex === -1) throw new Error('변경 요청을 찾을 수 없습니다.');
      
      const request = changeRequests[requestIndex];
      
      const updatedRequest: DocumentChangeRequest = {
        ...request,
        status,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewComment
      };
      
      changeRequests[requestIndex] = updatedRequest;
      
      // 승인된 경우 문서 업데이트
      if (status === 'approved') {
        const documentIndex = documents.findIndex(doc => doc.id === request.documentId);
        if (documentIndex !== -1) {
          const document = documents[documentIndex];
          
          // 문서 이력 저장
          const history: DocumentHistory = {
            id: `hist_${Date.now()}`,
            documentId: document.id,
            content: document.content,
            version: document.version,
            editedBy: document.lastEditedBy,
            editedAt: document.updatedAt,
            changeDescription: '이전 버전'
          };
          documentHistories.push(history);
          
          // 문서 업데이트
          const updatedDocument: Document = {
            ...document,
            content: request.proposedContent,
            lastEditedBy: request.proposedBy,
            updatedAt: new Date(),
            version: document.version + 1
          };
          
          documents[documentIndex] = updatedDocument;
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
      // API 실패시 Mock 데이터 사용
      return documentHistories
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
      // API 실패시 Mock 데이터 사용
      if (status) {
        return changeRequests.filter(req => req.status === status);
      }
      return [...changeRequests];
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
      // API 실패시 Mock 데이터 사용
      const request = changeRequests.find(req => req.id === requestId);
      return request || null;
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
      // API 실패시 Mock 데이터 사용
      return [...categories];
    }
  }
};

export default docsService;
