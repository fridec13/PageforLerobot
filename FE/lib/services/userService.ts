import axios from 'axios';

// API 클라이언트 가져오기
import apiClient from '@/lib/services/apiClient';

// 인터페이스 정의
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  title?: string; // 칭호
  profileImage?: string; // 프로필 이미지
  contribution?: number; // 기여 횟수
  badges?: string[]; // 획득한 배지 목록
  createdAt?: Date; // 가입일
}

export interface ProfileUpdateRequest {
  username?: string;
  email?: string;
  title?: string;
  profileImage?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

// 사용자 서비스
const userService = {
  // 내 프로필 조회
  getMyProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },
  
  // 특정 사용자 프로필 조회
  getUserProfile: async (userId: string): Promise<UserProfile> => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },
  
  // 프로필 업데이트
  updateProfile: async (data: ProfileUpdateRequest): Promise<UserProfile> => {
    const response = await apiClient.patch('/users/me', data);
    return response.data;
  },
  
  // 비밀번호 변경
  changePassword: async (data: PasswordChangeRequest): Promise<void> => {
    await apiClient.post('/users/change-password', data);
  },
  
  // 내 기여 이력 조회
  getMyContributions: async (page = 1, limit = 10): Promise<any> => {
    const response = await apiClient.get(`/users/me/contributions?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  // 내 메시지 목록 조회
  getMyMessages: async (page = 1, limit = 10): Promise<any> => {
    const response = await apiClient.get(`/users/me/messages?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  // 메시지 읽음 처리
  markMessageAsRead: async (messageId: string): Promise<void> => {
    await apiClient.patch(`/users/me/messages/${messageId}/read`);
  },
  
  // 메시지 삭제
  deleteMessage: async (messageId: string): Promise<void> => {
    await apiClient.delete(`/users/me/messages/${messageId}`);
  },
  
  // 메시지 전송 (관리자용)
  sendMessage: async (userId: string, content: string): Promise<void> => {
    await apiClient.post('/admin/messages', { userId, content });
  },
  
  // 칭호 목록 조회
  getTitles: async (): Promise<any> => {
    const response = await apiClient.get('/titles');
    return response.data;
  },
  
  // 칭호 변경
  setActiveTitle: async (titleId: string): Promise<void> => {
    await apiClient.post(`/users/me/titles/active`, { titleId });
  }
};

export default userService; 