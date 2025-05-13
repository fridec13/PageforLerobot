import axios from 'axios';
import { 
  WikiDocument, 
  Revision, 
  Discussion, 
  Comment,
  Category,
  WikiListOptions,
  SearchResult,
  User,
  CreateWikiDTO,
  UpdateWikiDTO
} from '../models/wiki';

// API URL 설정
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * 위키 API 호출을 위한 Axios 인스턴스
 * JWT 토큰을 헤더에 포함하여 인증된 요청 수행
 */
const apiClient = axios.create({
  baseURL: `${API_URL}/wiki`,
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
          console.log('토큰 발견:', token ? '있음' : '없음');
        } else {
          // 기존 방식으로 시도
          token = localStorage.getItem('token');
          console.log('기존 방식으로 토큰 시도:', token ? '있음' : '없음');
        }
      }
      
      if (token) {
        // Bearer 접두사 추가 (백엔드가 이 형식을 기대할 경우)
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('요청 헤더에 토큰 추가됨');
      } else {
        console.log('토큰이 없어 인증 헤더가 추가되지 않음');
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

/**
 * 위키 서비스 객체
 * 위키 문서의 CRUD 작업과 관련 기능을 제공
 */
const wikiService = {
  /**
   * 위키 문서 목록 조회
   * 
   * @param options 필터링 및 정렬 옵션
   * @returns 위키 문서 목록과 메타데이터
   * 
   * GET /api/wiki
   */
  getDocuments: async (options?: WikiListOptions): Promise<{ documents: WikiDocument[], total: number }> => {
    try {
      const response = await apiClient.get('', { params: options });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching wiki documents:', error);
      throw error;
    }
  },
  
  /**
   * 인기 위키 문서 조회
   * 
   * @param limit 가져올 문서 수
   * @returns 인기 위키 문서 목록
   * 
   * GET /api/wiki/popular
   */
  getPopularDocuments: async (limit: number = 4): Promise<WikiDocument[]> => {
    try {
      const response = await apiClient.get('/popular', { params: { limit } });
      return response.data.data.map(transformDocumentResponse);
    } catch (error) {
      console.error('Error fetching popular wiki documents:', error);
      throw error;
    }
  },
  
  /**
   * 최근 수정된 위키 문서 조회
   * 
   * @param limit 가져올 문서 수
   * @returns 최근 수정된 위키 문서 목록
   * 
   * GET /api/wiki/recent
   */
  getRecentDocuments: async (limit: number = 3): Promise<WikiDocument[]> => {
    try {
      const response = await apiClient.get('/recent', { params: { limit } });
      return response.data.data.map(transformDocumentResponse);
    } catch (error) {
      console.error('Error fetching recent wiki documents:', error);
      throw error;
    }
  },
  
  /**
   * 새로 생성된 위키 문서 조회
   * 
   * @param limit 가져올 문서 수
   * @returns 새로 생성된 위키 문서 목록
   * 
   * GET /api/wiki (생성일 기준 정렬)
   */
  getNewDocuments: async (limit: number = 3): Promise<WikiDocument[]> => {
    try {
      const response = await apiClient.get('', { 
        params: { 
          sortBy: 'createdAt', 
          sortOrder: 'desc',
          limit
        } 
      });
      
      return response.data.data.documents.map(transformDocumentResponse);
    } catch (error) {
      console.error('Error fetching new wiki documents:', error);
      throw error;
    }
  },
  
  /**
   * 특정 슬러그의 위키 문서 조회
   * 
   * @param slug 문서 슬러그
   * @returns 위키 문서 객체
   * 
   * GET /api/wiki/:slug
   */
  getDocumentBySlug: async (slug: string): Promise<WikiDocument> => {
    try {
      const response = await apiClient.get(`/${slug}`);
      return transformDocumentResponse(response.data.data);
    } catch (error) {
      console.error(`Error fetching wiki document ${slug}:`, error);
      throw error;
    }
  },
  
  /**
   * 새 위키 문서 생성
   * 
   * @param documentData 생성할 문서 정보
   * @returns 생성된 위키 문서
   * 
   * POST /api/wiki
   */
  createDocument: async (documentData: CreateWikiDTO): Promise<WikiDocument> => {
    try {
      // 백엔드로 전송할 데이터 준비
      const payload: any = { ...documentData };
      
      // 사용자 객체 대신 ID만 전송
      if (payload.createdBy && typeof payload.createdBy === 'object') {
        payload.userId = payload.createdBy.id;
        delete payload.createdBy; // createdBy 객체는 제거
      }
      
      // 요청 전 데이터 확인
      console.log('문서 생성 요청 데이터:', payload);
      
      const response = await apiClient.post('', payload);
      return transformDocumentResponse(response.data.data);
    } catch (error) {
      console.error('Error creating wiki document:', error);
      throw error;
    }
  },
  
  /**
   * 위키 문서 수정
   * 
   * @param slug 수정할 문서 슬러그
   * @param updates 변경할 내용
   * @param comment 수정 사유
   * @returns 수정된 위키 문서
   * 
   * PUT /api/wiki/:slug
   */
  updateDocument: async (slug: string, updates: UpdateWikiDTO, comment: string): Promise<WikiDocument> => {
    try {
      // 백엔드에 전송할 데이터 준비
      const payload: UpdateWikiDTO = { ...updates, comment };
      
      // lastModifiedBy 처리 - 객체가 전달되면 ID만 추출
      if (payload.lastModifiedBy && typeof payload.lastModifiedBy === 'object') {
        payload.userId = payload.lastModifiedBy.id;
        delete payload.lastModifiedBy; // lastModifiedBy 객체는 제거
      }
      
      console.log('문서 업데이트 요청 데이터:', payload);
      
      const response = await apiClient.put(`/${slug}`, payload);
      return transformDocumentResponse(response.data.data);
    } catch (error: any) {
      console.error(`Error updating wiki document ${slug}:`, error);
      
      // 서버 응답에 에러 메시지가 있으면 로그에 출력
      if (error.response && error.response.data) {
        console.error('서버 응답 상세 오류:', error.response.data);
        
        // 서버에서 메시지를 반환했다면 그것을 사용
        if (error.response.data.message || error.response.data.error) {
          throw new Error(error.response.data.message || error.response.data.error);
        }
      }
      
      throw error;
    }
  },
  
  /**
   * 위키 문서 삭제
   * 
   * @param slug 삭제할 문서 슬러그
   * @returns 성공 여부
   * 
   * DELETE /api/wiki/:slug
   */
  deleteDocument: async (slug: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/${slug}`);
      return true;
    } catch (error) {
      console.error(`Error deleting wiki document ${slug}:`, error);
      throw error;
    }
  },
  
  /**
   * 문서 수정 이력 조회
   * 
   * @param slug 문서 슬러그
   * @returns 수정 이력 목록
   * 
   * GET /api/wiki/:slug/revisions
   */
  getRevisions: async (slug: string): Promise<Revision[]> => {
    try {
      const response = await apiClient.get(`/${slug}/revisions`);
      return response.data.data.map((rev: any) => ({
        ...rev,
        createdAt: new Date(rev.createdAt),
      }));
    } catch (error) {
      console.error(`Error fetching revisions for ${slug}:`, error);
      throw error;
    }
  },
  
  /**
   * 문서 토론 목록 조회
   * 
   * @param slug 문서 슬러그
   * @returns 토론 목록
   * 
   * GET /api/wiki/:slug/discussions
   */
  getDiscussions: async (slug: string): Promise<Discussion[]> => {
    try {
      const response = await apiClient.get(`/${slug}/discussions`);
      return response.data.data.map((disc: any) => ({
        ...disc,
        createdAt: new Date(disc.createdAt),
        updatedAt: new Date(disc.updatedAt),
        comments: disc.comments.map((comment: any) => ({
          ...comment,
          createdAt: new Date(comment.createdAt),
        })),
      }));
    } catch (error) {
      console.error(`Error fetching discussions for ${slug}:`, error);
      throw error;
    }
  },
  
  /**
   * 위키 검색
   * 
   * @param query 검색어
   * @param options 검색 옵션
   * @returns 검색 결과
   * 
   * GET /api/wiki/search
   */
  search: async (query: string, options?: Partial<WikiListOptions>): Promise<SearchResult[]> => {
    try {
      const response = await apiClient.get('/search', { params: { query, ...options } });
      return response.data.data.map((result: any) => ({
        ...result,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      }));
    } catch (error) {
      console.error(`Error searching wiki for "${query}":`, error);
      throw error;
    }
  },
  
  /**
   * 카테고리 목록 조회
   * 
   * @returns 카테고리 목록
   * 
   * GET /api/wiki/categories
   */
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get('/categories');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
};

// 백엔드 응답을 위키 문서 형식으로 변환하는 함수
const transformDocumentResponse = (doc: any): WikiDocument => {
  if (!doc) return doc;
  
  // 디버그용 로깅
  console.log('API 응답 데이터:', doc);
  
  // 일관된 카테고리 처리: 항상 Category 객체 배열로 처리
  const categories = Array.isArray(doc.categories) ? doc.categories : [];
  
  // 누락될 수 있는 필드들에 대한 안전한 처리
  const transformedDoc = {
    ...doc,
    id: doc.id || '',
    slug: doc.slug || '',
    title: doc.title || '',
    content: doc.content || '',
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
    createdBy: doc.createdBy || { id: '', name: '알 수 없음', email: '', role: '' },
    lastModifiedBy: doc.lastModifiedBy || { id: '', name: '알 수 없음', email: '', role: '' },
    viewCount: doc.viewCount || 0,
    // 카테고리 처리
    categories: categories.map((cat: any) => {
      if (typeof cat === 'object' && cat !== null) {
        return {
          id: cat.id || '',
          name: cat.name || '알 수 없음',
          slug: cat.slug || 'unknown',
          description: cat.description || ''
        };
      }
      return {
        id: cat || '',
        name: '알 수 없음',
        slug: 'unknown',
        description: ''
      };
    })
  };
  
  console.log('변환된 문서:', transformedDoc);
  return transformedDoc;
};

export default wikiService; 