'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import apiClient from './services/apiClient';

// API URL 기본값 설정 - 백엔드 서버는 이미 /api 경로를 포함하고 있음
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// 사용자 타입 정의
export interface User {
  id: string;
  name?: string;
  email?: string;
  role: string;
  title?: string;
  image?: string;
  contribution?: number;
  badges?: Array<string | { id: string; name: string; description: string; image?: string }>;
}

// 인증 상태 저장소
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// 회원가입 데이터 타입
interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// 인증 Zustand 스토어
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // 로그인 함수
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // 디버깅을 위한 로그
          console.log('로그인 시도:', { email });
          console.log('API 기본 URL:', apiClient.defaults.baseURL);
          
          // apiClient 인스턴스 사용
          const response = await apiClient.post('/auth/login', { 
            email, 
            password 
          });
          
          console.log('로그인 응답:', response.data);
          
          if (response.data.success) {
            const { user, token } = response.data.data;
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return true;
          }
          
          set({ isLoading: false, error: '로그인에 실패했습니다.' });
          return false;
        } catch (error: any) {
          console.error('로그인 API 호출 실패:', error);
          
          set({ 
            isLoading: false, 
            error: error.response?.data?.error || '로그인 중 오류가 발생했습니다.' 
          });
          
          return false;
        }
      },
      
      // 회원가입 함수
      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          // apiClient 인스턴스 사용
          const response = await apiClient.post('/auth/register', userData);
          
          if (response.data.success) {
            set({ isLoading: false });
            return true;
          }
          
          set({ 
            isLoading: false, 
            error: response.data.error || '회원가입에 실패했습니다.' 
          });
          return false;
        } catch (error: any) {
          console.error('회원가입 API 호출 실패:', error);
          
          set({ 
            isLoading: false, 
            error: error.response?.data?.error || '회원가입 중 오류가 발생했습니다.' 
          });
          
          return false;
        }
      },
      
      // 로그아웃 함수
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },
      
      // 에러 초기화
      clearError: () => {
        set({ error: null });
      },
      
      // 사용자 정보 업데이트
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          });
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

// 사용자 정보 로드 함수
export async function loadUserProfile() {
  const { token, isAuthenticated, updateUser } = useAuthStore.getState();
  
  // 토큰이 없거나 인증되지 않은 상태라면 API 호출을 하지 않음
  if (!token || !isAuthenticated) {
    console.log('토큰이 없거나 인증되지 않아 사용자 정보 로드 건너뜀');
    return false;
  }
  
  try {
    // apiClient 인스턴스 사용
    const response = await apiClient.get('/users/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      updateUser(response.data.data);
      return true;
    }
  } catch (error) {
    console.error('사용자 정보 로드 실패:', error);
    // 토큰이 유효하지 않으면 로그아웃
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
  }
  
  return false;
}

// 인증 상태 관리 훅
export function useAuth() {
  const { user, isAuthenticated, isLoading, error } = useAuthStore();
  
  // 역할 기반 권한 확인
  const isAdmin = user?.role === 'ADMIN';
  const isModerator = user?.role === 'ADMIN' || user?.role === 'MODERATOR';
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isAdmin,
    isModerator,
  };
} 