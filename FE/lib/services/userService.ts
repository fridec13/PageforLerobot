import { User, useAuthStore } from '../auth';
import apiClient from './apiClient';

// 인터페이스 정의
export interface UserProfile extends User {
  createdAt?: Date;
}

export interface ProfileUpdateRequest {
  name?: string;
  email?: string;
  title?: string;
  image?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserContribution {
  id: string;
  type: 'DOCUMENT' | 'WIKI' | 'FORUM';
  title: string;
  createdAt: Date;
}

export interface UserMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 현재 인증된 사용자의 ID 가져오기
const getCurrentUserId = (): string | null => {
  if (typeof window !== 'undefined') {
    const { user } = useAuthStore.getState();
    return user?.id || null;
  }
  return null;
};

// API를 호출하는 사용자 서비스
const userService = {
  // 내 프로필 조회
  getMyProfile: async (): Promise<UserProfile> => {
    try {
      const response = await apiClient.get('/users/me');
      return response.data.data;
    } catch (error) {
      console.error('프로필 조회 실패:', error);
      throw error;
    }
  },
  
  // 특정 사용자 프로필 조회
  getUserProfile: async (userId: string): Promise<UserProfile> => {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('사용자 프로필 조회 실패:', error);
      throw error;
    }
  },
  
  // 프로필 업데이트
  updateProfile: async (data: ProfileUpdateRequest): Promise<UserProfile> => {
    try {
      const response = await apiClient.patch('/users/me', data);
      
      // 사용자 정보가 업데이트되면 Zustand 스토어도 업데이트
      if (response.data.success) {
        useAuthStore.getState().updateUser(response.data.data);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      throw error;
    }
  },
  
  // 비밀번호 변경
  changePassword: async (data: PasswordChangeRequest): Promise<void> => {
    try {
      await apiClient.post('/users/change-password', data);
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      throw error;
    }
  },
  
  // 내 기여 이력 조회
  getMyContributions: async (page = 1, limit = 10): Promise<PaginatedResponse<UserContribution>> => {
    try {
      const response = await apiClient.get(`/users/contributions?page=${page}&limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('기여 이력 조회 실패:', error);
      throw error;
    }
  },
  
  // 내 메시지 목록 조회
  getMyMessages: async (page = 1, limit = 10): Promise<PaginatedResponse<UserMessage>> => {
    try {
      const response = await apiClient.get(`/users/messages?page=${page}&limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('메시지 목록 조회 실패:', error);
      throw error;
    }
  },
  
  // 메시지 읽음 처리
  markMessageAsRead: async (messageId: string): Promise<void> => {
    try {
      await apiClient.patch(`/users/messages/${messageId}`);
    } catch (error) {
      console.error('메시지 읽음 처리 실패:', error);
      throw error;
    }
  },
  
  // 메시지 삭제
  deleteMessage: async (messageId: string): Promise<void> => {
    try {
      await apiClient.delete(`/users/messages/${messageId}`);
    } catch (error) {
      console.error('메시지 삭제 실패:', error);
      throw error;
    }
  },
  
  // 메시지 전송 (관리자용)
  sendMessage: async (receiverId: string, content: string): Promise<void> => {
    try {
      await apiClient.post('/users/messages', {
        receiverId,
        content
      });
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      throw error;
    }
  },
  
  // 칭호 목록 조회
  getTitles: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get('/users/titles');
      return response.data.data;
    } catch (error) {
      console.error('칭호 목록 조회 실패:', error);
      throw error;
    }
  },
  
  // 칭호 변경
  setActiveTitle: async (title: string): Promise<void> => {
    try {
      await apiClient.post('/users/title', { title });
      
      // 칭호가 변경되면 Zustand 스토어도 업데이트
      useAuthStore.getState().updateUser({ title });
    } catch (error) {
      console.error('칭호 변경 실패:', error);
      throw error;
    }
  }
};

export default userService; 