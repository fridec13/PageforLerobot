// services/docsService.ts

import { Document, DocumentHistory, Category, DocumentChangeRequest, RequestStatus } from '../models/docs';
import { mockDocuments, mockDocumentHistories, mockCategories, mockChangeRequests } from '../mock-data/docs-data';

// 데이터 저장소 (Mock 데이터 사용)
let documents: Document[] = [...mockDocuments];
let documentHistories: DocumentHistory[] = [...mockDocumentHistories];
let categories: Category[] = [...mockCategories];
let changeRequests: DocumentChangeRequest[] = [...mockChangeRequests];

/**
 * 문서 조회
 * @param path - 문서 경로
 * @returns 조회된 문서 또는 null
 */
export async function getDocumentByPath(path: string): Promise<Document | null> {
  const document = documents.find(doc => doc.path === path && doc.isPublished);
  return document || null;
}

/**
 * 문서 ID로 조회
 * @param id - 문서 ID
 * @returns 조회된 문서 또는 null
 */
export async function getDocumentById(id: string): Promise<Document | null> {
  const document = documents.find(doc => doc.id === id);
  return document || null;
}

/**
 * 카테고리별 문서 목록 조회
 * @param categoryPath - 카테고리 경로
 * @returns 문서 목록
 */
export async function getDocumentsByCategory(categoryPath: string): Promise<Document[]> {
  const category = categories.find(cat => cat.path === categoryPath);
  if (!category) return [];
  
  return documents.filter(doc => 
    doc.categoryId === category.id && doc.isPublished
  );
}

/**
 * 모든 문서 목록 조회
 * @returns 문서 목록
 */
export async function getAllDocuments(): Promise<Document[]> {
  return documents.filter(doc => doc.isPublished);
}

/**
 * 문서 생성
 * @param documentData - 문서 데이터
 * @param userId - 작성자 ID
 * @returns 생성된 문서
 */
export async function createDocument(
  documentData: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastEditedBy' | 'isPublished' | 'version'>, 
  userId: string
): Promise<Document> {
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

/**
 * 문서 수정
 * @param id - 문서 ID
 * @param documentData - 수정할 문서 데이터
 * @param userId - 수정자 ID
 * @returns 수정된 문서
 */
export async function updateDocument(
  id: string,
  documentData: Partial<Document>,
  userId: string
): Promise<Document | null> {
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

/**
 * 문서 수정 요청 생성
 * @param documentId - 문서 ID
 * @param proposedContent - 제안된 내용
 * @param userId - 요청자 ID
 * @returns 생성된 변경 요청
 */
export async function createChangeRequest(
  documentId: string, 
  proposedContent: string, 
  userId: string
): Promise<DocumentChangeRequest> {
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

/**
 * 변경 요청 검토
 * @param requestId - 변경 요청 ID
 * @param status - 검토 결과 (approved/rejected)
 * @param reviewComment - 검토 코멘트
 * @param reviewerId - 검토자 ID
 * @returns 업데이트된 변경 요청
 */
export async function reviewChangeRequest(
  requestId: string, 
  status: RequestStatus, 
  reviewComment: string, 
  reviewerId: string
): Promise<DocumentChangeRequest> {
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

/**
 * 문서 이력 조회
 * @param documentId - 문서 ID
 * @returns 문서 이력 목록
 */
export async function getDocumentHistory(documentId: string): Promise<DocumentHistory[]> {
  return documentHistories
    .filter(history => history.documentId === documentId)
    .sort((a, b) => b.version - a.version);
}

/**
 * 변경 요청 목록 조회
 * @param status - 변경 요청 상태 (선택적)
 * @returns 변경 요청 목록
 */
export async function getChangeRequests(status?: RequestStatus): Promise<DocumentChangeRequest[]> {
  if (status) {
    return changeRequests.filter(req => req.status === status);
  }
  return [...changeRequests];
}

/**
 * 변경 요청 상세 조회
 * @param requestId - 변경 요청 ID
 * @returns 변경 요청 또는 null
 */
export async function getChangeRequestById(requestId: string): Promise<DocumentChangeRequest | null> {
  const request = changeRequests.find(req => req.id === requestId);
  return request || null;
}

/**
 * 모든 카테고리 조회
 * @returns 카테고리 목록
 */
export async function getAllCategories(): Promise<Category[]> {
  return [...categories];
}

module.exports = {
  getDocumentByPath,
  getDocumentsByCategory,
  createDocument,
  createChangeRequest,
  reviewChangeRequest,
  getDocumentHistory,
  getChangeRequests,
  getChangeRequestById,
  getAllCategories
};
