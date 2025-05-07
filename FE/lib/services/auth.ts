import apiClient from '@/lib/services/apiClient';

// 인터페이스 정의
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    title?: string; // 칭호
    profileImage?: string; // 프로필 이미지
  };
}

// 인증 서비스
const authService = {
  // 로그인
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    
    // 토큰과 사용자 정보 저장
    if (response.data.token) {
      localStorage.setItem('jwt', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  
  // 회원가입
  register: async (data: RegisterRequest): Promise<any> => {
    const response = await apiClient.post('/users/signup', data);
    return response.data;
  },
  
  // 로그아웃
  logout: () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  },
  
  // 현재 사용자 정보 가져오기
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
  
  // 사용자 프로필 가져오기
  fetchMyProfile: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },
  
  // 토큰 체크 (인증 상태 확인)
  isAuthenticated: () => {
    return !!localStorage.getItem('jwt');
  }
};

export default authService; 