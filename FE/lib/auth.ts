'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockUsers } from './mock-data/users-data';
import { ROLES, TITLES, getTitleByContributions } from './constants';
import apiClient from './services/apiClient';

// 사용자 타입 정의
export interface User {
  id: string;
  name?: string;
  email?: string;
  role: string;
  title?: string;
  image?: string;
  contribution?: number;
  badges?: string[];
}

// 인증 상태 저장소
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

// 인증 Zustand 스토어
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // API를 통한 로그인 요청
          const response = await apiClient.post('/api/auth/login', { 
            email, 
            password 
          });
          
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
          
          // API 실패 시 Mock 인증 로직으로 대체 (개발 편의성 목적)
          const user = mockUsers.find(u => u.email === email);
          
          if (user && password === '1234') { // 모든 사용자의 기본 비밀번호는 1234로 가정
            set({
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                title: user.title,
                image: user.image,
                contribution: user.contribution,
                badges: user.badges
              },
              token: user.id, // Mock 토큰으로 ID 사용
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return true;
          }
          
          return false;
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

// 임시 사용자 로드 함수 (앱 초기화 시 사용)
export function initializeAuth() {
  const { isLoading, user, token } = useAuthStore.getState();
  
  if (isLoading) {
    // 로컬 스토리지에서 사용자 정보를 이미 불러왔다면 로딩 상태 해제
    setTimeout(() => {
      useAuthStore.setState({ isLoading: false });
      
      // 토큰이 있으면 API에서 최신 사용자 정보 로드 시도
      if (token) {
        apiClient.get('/api/users/me')
          .then(response => {
            if (response.data.success) {
              useAuthStore.setState({ 
                user: response.data.data,
                isAuthenticated: true
              });
            }
          })
          .catch(error => {
            console.error('사용자 정보 갱신 실패:', error);
          });
      }
    }, 500);
  }
}

// 인증 상태 관리 훅
export function useAuth() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  
  // 타입 안전성을 위한 역할 추출
  const role = user?.role || ROLES.USER;
  
  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: role === ROLES.ADMIN,
    isModerator: role === ROLES.ADMIN || role === ROLES.MODERATOR,
  };
} 