import axios from 'axios';
import { 
  WikiDocument, 
  Revision, 
  Discussion, 
  Comment,
  Category,
  WikiListOptions,
  SearchResult
} from '../models/wiki';

// API URL 설정
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 더미 데이터: 인기 위키 문서
 */
const DUMMY_POPULAR_DOCUMENTS: WikiDocument[] = [
  {
    id: '1',
    slug: 'robot-basics',
    title: '로봇 공학 기초',
    content: '로봇 공학의 기초적인 개념과 역사에 대한 설명...',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-06-20'),
    createdBy: { id: 'user1', username: 'RobotMaster', email: 'master@example.com', role: 'user' },
    lastModifiedBy: { id: 'user2', username: 'TechGuru', email: 'guru@example.com', role: 'user' },
    viewCount: 1250,
    categories: [
      { id: 'cat1', name: '기초', slug: 'basics', description: '기초 지식' }
    ]
  },
  {
    id: '2',
    slug: 'robot-sensors',
    title: '로봇 센서의 종류와 활용',
    content: '다양한 로봇 센서의 원리와 활용 방법에 대한 상세 설명...',
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-07-15'),
    createdBy: { id: 'user2', username: 'TechGuru', email: 'guru@example.com', role: 'user' },
    lastModifiedBy: { id: 'user2', username: 'TechGuru', email: 'guru@example.com', role: 'user' },
    viewCount: 980,
    categories: [
      { id: 'cat2', name: '기술', slug: 'technology', description: '기술 관련' }
    ]
  },
  {
    id: '3',
    slug: 'robot-programming',
    title: '로봇 프로그래밍 입문',
    content: '로봇 프로그래밍을 시작하는 방법과 기본 개념...',
    createdAt: new Date('2023-03-05'),
    updatedAt: new Date('2023-08-10'),
    createdBy: { id: 'user3', username: 'CodeNinja', email: 'ninja@example.com', role: 'user' },
    lastModifiedBy: { id: 'user1', username: 'RobotMaster', email: 'master@example.com', role: 'user' },
    viewCount: 1540,
    categories: [
      { id: 'cat3', name: '프로그래밍', slug: 'programming', description: '프로그래밍 관련' }
    ]
  },
  {
    id: '4',
    slug: 'ai-robot-future',
    title: '인공지능과 로봇의 미래',
    content: '인공지능 기술의 발전과 로봇 산업의 미래 전망...',
    createdAt: new Date('2023-04-20'),
    updatedAt: new Date('2023-09-05'),
    createdBy: { id: 'user4', username: 'FutureTech', email: 'future@example.com', role: 'user' },
    lastModifiedBy: { id: 'user4', username: 'FutureTech', email: 'future@example.com', role: 'user' },
    viewCount: 2100,
    categories: [
      { id: 'cat4', name: '전망', slug: 'future', description: '미래 전망' }
    ]
  }
];

/**
 * 더미 데이터: 최근 수정된 문서
 */
const DUMMY_RECENT_DOCUMENTS: WikiDocument[] = [
  {
    id: '5',
    slug: 'robotic-arm-control',
    title: '로봇 팔 제어 알고리즘',
    content: '로봇 팔의 제어 알고리즘과 구현 방법...',
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date(Date.now() - 3600000), // 1시간 전
    createdBy: { id: 'user1', username: 'RobotMaster', email: 'master@example.com', role: 'user' },
    lastModifiedBy: { id: 'user5', username: 'JK', email: 'jk@example.com', role: 'user', title: '전문가' },
    viewCount: 450,
    categories: [
      { id: 'cat5', name: '제어', slug: 'control', description: '제어 기술' }
    ]
  },
  {
    id: '6',
    slug: 'robot-navigation',
    title: '로봇 내비게이션 시스템',
    content: '로봇의 자율 주행과 내비게이션 기술...',
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date(Date.now() - 10800000), // 3시간 전
    createdBy: { id: 'user2', username: 'TechGuru', email: 'guru@example.com', role: 'user' },
    lastModifiedBy: { id: 'user6', username: 'MS', email: 'ms@example.com', role: 'user' },
    viewCount: 320,
    categories: [
      { id: 'cat6', name: '자율주행', slug: 'autonomous', description: '자율 주행' }
    ]
  },
  {
    id: '7',
    slug: 'ros2-basics',
    title: 'ROS2 기초',
    content: 'Robot Operating System 2의 기본 개념과 사용법...',
    createdAt: new Date('2023-07-05'),
    updatedAt: new Date(Date.now() - 21600000), // 6시간 전
    createdBy: { id: 'user3', username: 'CodeNinja', email: 'ninja@example.com', role: 'user' },
    lastModifiedBy: { id: 'user7', username: 'YJ', email: 'yj@example.com', role: 'user' },
    viewCount: 780,
    categories: [
      { id: 'cat7', name: 'ROS', slug: 'ros', description: 'Robot Operating System' }
    ]
  }
];

/**
 * 더미 데이터: 카테고리 목록
 */
const DUMMY_CATEGORIES: Category[] = [
  { id: 'cat1', name: '기초 지식', slug: 'basics', description: '로봇 공학의 기초 개념' },
  { id: 'cat2', name: '하드웨어', slug: 'hardware', description: '로봇 하드웨어 관련' },
  { id: 'cat3', name: '소프트웨어', slug: 'software', description: '로봇 소프트웨어 관련' },
  { id: 'cat4', name: '인공지능', slug: 'ai', description: '로봇 인공지능 기술' },
  { id: 'cat5', name: '센서 기술', slug: 'sensors', description: '로봇 센서 관련 기술' },
  { id: 'cat6', name: '응용 분야', slug: 'applications', description: '로봇 응용 분야' },
  { id: 'cat7', name: '프로그래밍', slug: 'programming', description: '로봇 프로그래밍' },
  { id: 'cat8', name: '미래 기술', slug: 'future', description: '로봇 미래 기술' }
];

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
      // 실제 API 호출
      // const response = await apiClient.get('', { params: options });
      // return response.data;
      
      // 더미 데이터 반환
      const allDocuments = [...DUMMY_POPULAR_DOCUMENTS, ...DUMMY_RECENT_DOCUMENTS];
      return {
        documents: allDocuments,
        total: allDocuments.length
      };
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
      // 실제 API 호출
      // const response = await apiClient.get('/popular', { params: { limit } });
      // return response.data;
      
      // 더미 데이터 반환
      return DUMMY_POPULAR_DOCUMENTS.slice(0, limit);
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
      // 실제 API 호출
      // const response = await apiClient.get('/recent', { params: { limit } });
      // return response.data;
      
      // 더미 데이터 반환
      return DUMMY_RECENT_DOCUMENTS.slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent wiki documents:', error);
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
      // 실제 API 호출
      // const response = await apiClient.get(`/${slug}`);
      // return response.data;
      
      // 더미 데이터에서 찾기
      const allDocuments = [...DUMMY_POPULAR_DOCUMENTS, ...DUMMY_RECENT_DOCUMENTS];
      const document = allDocuments.find(doc => doc.slug === slug);
      
      if (!document) {
        throw new Error(`Document not found: ${slug}`);
      }
      
      return document;
    } catch (error) {
      console.error(`Error fetching wiki document ${slug}:`, error);
      throw error;
    }
  },
  
  /**
   * 새 위키 문서 생성
   * 
   * @param document 생성할 문서 정보
   * @returns 생성된 위키 문서
   * 
   * POST /api/wiki
   */
  createDocument: async (document: Partial<WikiDocument>): Promise<WikiDocument> => {
    try {
      // 실제 API 호출
      // const response = await apiClient.post('', document);
      // return response.data;
      
      // 더미 응답 (실제로는 서버에서 저장 후 반환)
      return {
        id: `new-${Date.now()}`,
        slug: document.slug || '',
        title: document.title || '',
        content: document.content || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: document.createdBy || { id: 'current-user', username: '현재 사용자', email: 'user@example.com', role: 'user' },
        lastModifiedBy: document.createdBy || { id: 'current-user', username: '현재 사용자', email: 'user@example.com', role: 'user' },
        viewCount: 0,
        categories: document.categories || []
      };
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
  updateDocument: async (slug: string, updates: Partial<WikiDocument>, comment: string): Promise<WikiDocument> => {
    try {
      // 실제 API 호출
      // const response = await apiClient.put(`/${slug}`, { ...updates, comment });
      // return response.data;
      
      // 더미 응답
      const allDocuments = [...DUMMY_POPULAR_DOCUMENTS, ...DUMMY_RECENT_DOCUMENTS];
      const documentIndex = allDocuments.findIndex(doc => doc.slug === slug);
      
      if (documentIndex === -1) {
        throw new Error(`Document not found: ${slug}`);
      }
      
      // 업데이트된 문서 반환
      return {
        ...allDocuments[documentIndex],
        ...updates,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error(`Error updating wiki document ${slug}:`, error);
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
      // 실제 API 호출
      // await apiClient.delete(`/${slug}`);
      // return true;
      
      // 더미 응답
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
      // 실제 API 호출
      // const response = await apiClient.get(`/${slug}/revisions`);
      // return response.data;
      
      // 더미 데이터
      return [
        {
          id: 'rev1',
          documentId: slug,
          content: '초기 버전의 내용...',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30일 전
          createdBy: { id: 'user1', username: 'RobotMaster', email: 'master@example.com', role: 'user' },
          comment: '문서 생성'
        },
        {
          id: 'rev2',
          documentId: slug,
          content: '두 번째 버전의 내용...',
          diff: '내용 추가 및 수정...',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15일 전
          createdBy: { id: 'user2', username: 'TechGuru', email: 'guru@example.com', role: 'user' },
          comment: '내용 추가 및 오타 수정'
        },
        {
          id: 'rev3',
          documentId: slug,
          content: '최신 버전의 내용...',
          diff: '이미지 추가 및 내용 업데이트...',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2일 전
          createdBy: { id: 'user3', username: 'CodeNinja', email: 'ninja@example.com', role: 'user' },
          comment: '이미지 추가 및 내용 업데이트'
        }
      ];
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
      // 실제 API 호출
      // const response = await apiClient.get(`/${slug}/discussions`);
      // return response.data;
      
      // 더미 데이터
      return [
        {
          id: 'disc1',
          documentId: slug,
          title: '내용 추가 제안',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10일 전
          createdBy: { id: 'user1', username: 'RobotMaster', email: 'master@example.com', role: 'user' },
          status: 'resolved',
          comments: [
            {
              id: 'comm1',
              discussionId: 'disc1',
              content: '이 문서에 XX 내용을 추가하면 좋을 것 같습니다.',
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
              createdBy: { id: 'user1', username: 'RobotMaster', email: 'master@example.com', role: 'user' }
            },
            {
              id: 'comm2',
              discussionId: 'disc1',
              content: '좋은 제안입니다. 내용을 추가하겠습니다.',
              createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
              createdBy: { id: 'user2', username: 'TechGuru', email: 'guru@example.com', role: 'user' }
            }
          ]
        },
        {
          id: 'disc2',
          documentId: slug,
          title: '오류 수정 요청',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5일 전
          createdBy: { id: 'user3', username: 'CodeNinja', email: 'ninja@example.com', role: 'user' },
          status: 'open',
          comments: [
            {
              id: 'comm3',
              discussionId: 'disc2',
              content: 'XX 부분에 오류가 있습니다. YY로 수정이 필요합니다.',
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              createdBy: { id: 'user3', username: 'CodeNinja', email: 'ninja@example.com', role: 'user' }
            }
          ]
        }
      ];
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
      // 실제 API 호출
      // const response = await apiClient.get('/search', { params: { query, ...options } });
      // return response.data;
      
      // 더미 검색 결과
      const allDocuments = [...DUMMY_POPULAR_DOCUMENTS, ...DUMMY_RECENT_DOCUMENTS];
      
      // 간단한 검색 로직 (제목이나 내용에 검색어가 포함된 문서)
      const results = allDocuments
        .filter(doc => 
          doc.title.toLowerCase().includes(query.toLowerCase()) || 
          doc.content.toLowerCase().includes(query.toLowerCase())
        )
        .map(doc => ({
          id: doc.id,
          title: doc.title,
          slug: doc.slug,
          excerpt: doc.content.substring(0, 100) + '...',
          categories: doc.categories,
          updatedAt: doc.updatedAt,
          relevance: 1.0 // 실제로는 서버에서 관련성 점수 계산
        }));
      
      return results;
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
      // 실제 API 호출
      // const response = await apiClient.get('/categories');
      // return response.data;
      
      // 더미 데이터
      return DUMMY_CATEGORIES;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
};

export default wikiService; 