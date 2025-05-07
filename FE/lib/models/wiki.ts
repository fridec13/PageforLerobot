/**
 * 위키 시스템 데이터 모델
 * 
 * ERD 구성:
 * - WikiDocument (문서): 핵심 엔티티
 * - Revision (수정 이력): WikiDocument와 1:N 관계
 * - Discussion (토론): WikiDocument와 1:N 관계
 * - Comment (댓글): Discussion과 1:N 관계
 * - Category (카테고리): WikiDocument와 N:M 관계
 * - User: 모든 액션의 주체
 */

// 위키 문서 인터페이스
export interface WikiDocument {
  id: string;
  slug: string;           // URL 경로용 식별자 (ex: "robot-programming")
  title: string;          // 문서 제목
  content: string;        // 마크다운/HTML 내용
  createdAt: Date;
  updatedAt: Date;
  createdBy: User;        // 최초 작성자
  lastModifiedBy: User;   // 마지막 수정자
  viewCount: number;      // 조회수
  categories: Category[]; // 문서 카테고리
  revisions?: Revision[]; // 수정 이력
  discussions?: Discussion[]; // 토론
}

// 문서 수정 이력
export interface Revision {
  id: string;
  documentId: string;
  content: string;        // 수정 당시 내용
  diff?: string;          // 이전 버전과의 차이점
  createdAt: Date;
  createdBy: User;        // 수정한 사용자
  comment: string;        // 수정 이유
}

// 문서 토론
export interface Discussion {
  id: string;
  documentId: string;
  title: string;
  createdAt: Date;
  createdBy: User;
  status: 'open' | 'closed' | 'resolved';
  comments: Comment[];
}

// 토론 댓글
export interface Comment {
  id: string;
  discussionId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: User;
}

// 문서 카테고리
export interface Category {
  id: string;
  name: string;
  slug: string;           // URL 경로용 (ex: "programming")
  description?: string;
  parentId?: string;      // 상위 카테고리 ID (계층 구조)
  documents?: WikiDocument[]; // 해당 카테고리에 속한 문서들
}

// 사용자 인터페이스 (간소화 버전, auth.ts의 User와 통합 필요)
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  title?: string;         // 칭호
  profileImage?: string;  // 프로필 이미지
  contributions?: number; // 기여 횟수
}

// 검색 결과 인터페이스
export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string;        // 검색어가 포함된 문서 일부
  categories: Category[];
  updatedAt: Date;
  relevance: number;      // 검색 관련성 점수
}

// 목록 요청을 위한 필터 옵션
export interface WikiListOptions {
  category?: string;
  sortBy?: 'title' | 'updatedAt' | 'viewCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  query?: string;         // 검색어
} 