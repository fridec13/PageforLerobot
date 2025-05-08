/**
 * 문서 모델
 */
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
}

/**
 * 문서 이력 모델
 */
export interface DocumentHistory {
  id: string;
  documentId: string;
  content: string;
  version: number;
  editedBy: string;
  editedAt: Date;
  changeDescription?: string;
}

/**
 * 카테고리 모델
 */
export interface Category {
  id: string;
  name: string;
  path: string;
  description?: string;
  parentId?: string | null;
}

/**
 * 변경 요청 상태 타입
 */
export type RequestStatus = 'pending' | 'approved' | 'rejected';

/**
 * 변경 요청 모델
 */
export interface DocumentChangeRequest {
  id: string;
  documentId: string;
  proposedContent: string;
  proposedBy: string;
  status: RequestStatus;
  createdAt: Date;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  reviewComment?: string | null;
}

module.exports = {
  // 여기에 모델 관련 함수 구현
};
