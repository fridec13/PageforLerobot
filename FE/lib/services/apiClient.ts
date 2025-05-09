import axios from 'axios';
import { useAuthStore } from '../auth';

// 환경 변수에서 API URL을 가져오거나 기본값 사용
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// 개발 서버 api url
// const API_URL = 'http://localhost:8080/api';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 설정 - 인증 토큰을 헤더에 추가
apiClient.interceptors.request.use(
  (config) => {
    // 브라우저 환경에서만 실행
    if (typeof window !== 'undefined') {
      const { token } = useAuthStore.getState();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정 - 토큰 만료 등의 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 토큰 만료 오류 및 재시도되지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 토큰 만료 시 로그아웃 처리
        if (typeof window !== 'undefined') {
          // 현재 경로가 이미 로그인 페이지인 경우 리디렉션하지 않음
          if (window.location.pathname.includes('/auth/login')) {
            console.log('이미 로그인 페이지에 있어 리디렉션 스킵');
            return Promise.reject(error);
          }
          
          console.log('401 오류: 인증 토큰 만료 또는 유효하지 않음, 로그아웃 처리');
          // 현재 URL을 저장하여 로그인 후 리디렉션
          const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
          useAuthStore.getState().logout();
          window.location.href = `/auth/login?returnUrl=${returnUrl}`;
        }
        return Promise.reject(error);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 