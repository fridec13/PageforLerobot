import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService, { LoginRequest, RegisterRequest } from '../services/auth';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  title?: string;
  profileImage?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

// 인증 상태 관리 스토어
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // 로그인 액션
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || '로그인에 실패했습니다.',
            isAuthenticated: false,
            user: null,
          });
        }
      },

      // 회원가입 액션
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          await authService.register(userData);
          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || '회원가입에 실패했습니다.',
          });
        }
      },

      // 로그아웃 액션
      logout: () => {
        authService.logout();
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      // 프로필 가져오기
      fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const profileData = await authService.fetchMyProfile();
          set({
            user: profileData,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || '프로필을 불러오는데 실패했습니다.',
          });
        }
      },

      // 에러 초기화
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage', // 로컬 스토리지에 저장될 키 이름
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// 인증 상태 검사 및 초기화를 위한 훅
export const initializeAuth = () => {
  const { isAuthenticated, user } = useAuthStore.getState();
  
  // 로컬 스토리지에서 토큰 확인
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
  
  // 토큰이 있지만 상태가 인증되지 않은 경우 (예: 페이지 새로고침)
  if (token && !isAuthenticated) {
    const userFromStorage = authService.getCurrentUser();
    if (userFromStorage) {
      useAuthStore.setState({
        user: userFromStorage,
        isAuthenticated: true,
      });
    }
  }
  // 토큰이 없는데 인증 상태인 경우 (토큰 만료, 삭제 등)
  else if (!token && isAuthenticated) {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    });
  }
}; 