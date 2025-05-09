import { User, useAuthStore } from '../auth';
import { mockUsers, mockMessages, mockContributions, mockTitles, MockUser, Message } from '../mock-data/users-data';
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
  getMyProfile: async (userId: string): Promise<UserProfile> => {
    try {
      const response = await apiClient.get('/api/users/me');
      return response.data.data;
    } catch (error) {
      console.error('프로필 조회 실패:', error);
      // API 실패 시 Mock 데이터로 대체 (개발 편의성을 위해)
      
      // 현재 로그인한 사용자 정보가 있으면 해당 정보 사용
      const currentUserId = getCurrentUserId();
      const actualUserId = currentUserId || userId;
      
      const user = mockUsers.find(u => u.id === actualUserId);
      if (!user) throw new Error('사용자를 찾을 수 없습니다.');
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        image: user.image,
        contribution: user.contribution,
        badges: user.badges,
        createdAt: user.createdAt
      };
    }
  },
  
  // 특정 사용자 프로필 조회
  getUserProfile: async (userId: string): Promise<UserProfile> => {
    try {
      const response = await apiClient.get(`/api/users/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('사용자 프로필 조회 실패:', error);
      // API 실패 시 Mock 데이터로 대체
      const user = mockUsers.find(u => u.id === userId);
      if (!user) throw new Error('사용자를 찾을 수 없습니다.');
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        image: user.image,
        contribution: user.contribution,
        badges: user.badges,
        createdAt: user.createdAt
      };
    }
  },
  
  // 프로필 업데이트
  updateProfile: async (userId: string, data: ProfileUpdateRequest): Promise<UserProfile> => {
    try {
      const response = await apiClient.patch('/api/users/me', data);
      return response.data.data;
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      // API 실패 시 Mock 처리
      
      // 현재 로그인한 사용자 정보가 있으면 해당 정보 사용
      const currentUserId = getCurrentUserId();
      const actualUserId = currentUserId || userId;
      
      const userIndex = mockUsers.findIndex(u => u.id === actualUserId);
      if (userIndex === -1) throw new Error('사용자를 찾을 수 없습니다.');
      
      const updatedUser = {
        ...mockUsers[userIndex],
        ...data
      };
      
      // 실제 목 데이터 업데이트 (임시)
      if (data.name) mockUsers[userIndex].name = data.name;
      if (data.email) mockUsers[userIndex].email = data.email;
      if (data.title) mockUsers[userIndex].title = data.title;
      if (data.image) mockUsers[userIndex].image = data.image;
      
      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        title: updatedUser.title,
        image: updatedUser.image,
        contribution: updatedUser.contribution,
        badges: updatedUser.badges
      };
    }
  },
  
  // 비밀번호 변경
  changePassword: async (userId: string, data: PasswordChangeRequest): Promise<void> => {
    try {
      await apiClient.post('/api/users/password', data);
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      // Mock에서는 비밀번호 변경 무시
    }
    return Promise.resolve();
  },
  
  // 내 기여 이력 조회
  getMyContributions: async (userId: string, page = 1, limit = 10): Promise<PaginatedResponse<UserContribution>> => {
    try {
      const response = await apiClient.get(`/api/users/contributions?page=${page}&limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('기여 이력 조회 실패:', error);
      
      // 현재 로그인한 사용자 정보가 있으면 해당 정보 사용
      const currentUserId = getCurrentUserId();
      const actualUserId = currentUserId || userId;
      
      // Mock 기여 데이터 필터링
      const userContributions = mockContributions
        .filter(contrib => contrib.userId === actualUserId)
        .map(({ id, type, title, createdAt }) => ({
          id, type, title, createdAt
        }));
      
      const startIdx = (page - 1) * limit;
      const endIdx = startIdx + limit;
      
      return {
        items: userContributions.slice(startIdx, endIdx),
        total: userContributions.length,
        page,
        limit,
        totalPages: Math.ceil(userContributions.length / limit)
      };
    }
  },
  
  // 내 메시지 목록 조회
  getMyMessages: async (userId: string, page = 1, limit = 10): Promise<PaginatedResponse<UserMessage>> => {
    try {
      const response = await apiClient.get(`/api/users/messages?page=${page}&limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('메시지 목록 조회 실패:', error);
      
      // 현재 로그인한 사용자 정보가 있으면 해당 정보 사용
      const currentUserId = getCurrentUserId();
      const actualUserId = currentUserId || userId;
      
      // API 실패 시 Mock 데이터 사용
      const userMessages = mockMessages
        .filter(msg => msg.receiverId === actualUserId)
        .map(msg => {
          const sender = mockUsers.find(u => u.id === msg.senderId);
          return {
            id: msg.id,
            senderId: msg.senderId,
            senderName: sender?.name || '알 수 없음',
            content: msg.content,
            read: msg.read,
            createdAt: msg.createdAt
          };
        });
      
      const startIdx = (page - 1) * limit;
      const endIdx = startIdx + limit;
      
      return {
        items: userMessages.slice(startIdx, endIdx),
        total: userMessages.length,
        page,
        limit,
        totalPages: Math.ceil(userMessages.length / limit)
      };
    }
  },
  
  // 메시지 읽음 처리
  markMessageAsRead: async (userId: string, messageId: string): Promise<void> => {
    try {
      await apiClient.patch(`/api/users/messages/${messageId}`);
    } catch (error) {
      console.error('메시지 읽음 처리 실패:', error);
      
      // 현재 로그인한 사용자 정보가 있으면 해당 정보 사용
      const currentUserId = getCurrentUserId();
      const actualUserId = currentUserId || userId;
      
      // API 실패 시 Mock 처리
      const msgIndex = mockMessages.findIndex(msg => 
        msg.id === messageId && msg.receiverId === actualUserId
      );
      
      if (msgIndex !== -1) {
        mockMessages[msgIndex].read = true;
      }
    }
    return Promise.resolve();
  },
  
  // 메시지 삭제
  deleteMessage: async (userId: string, messageId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/users/messages/${messageId}`);
    } catch (error) {
      console.error('메시지 삭제 실패:', error);
      // Mock 처리는 생략
    }
    return Promise.resolve();
  },
  
  // 메시지 전송 (관리자용)
  sendMessage: async (senderId: string, receiverId: string, content: string): Promise<void> => {
    try {
      await apiClient.post('/api/users/messages', {
        receiverId,
        content
      });
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      // API 실패 시 Mock 처리
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        senderId,
        receiverId,
        content,
        read: false,
        createdAt: new Date()
      };
      
      mockMessages.push(newMessage);
    }
    return Promise.resolve();
  },
  
  // 칭호 목록 조회
  getTitles: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get('/api/users/titles');
      return response.data.data;
    } catch (error) {
      console.error('칭호 목록 조회 실패:', error);
      // 기본 칭호 목록 반환
      return mockTitles;
    }
  },
  
  // 칭호 변경
  setActiveTitle: async (userId: string, title: string): Promise<void> => {
    try {
      await apiClient.post('/api/users/title', { title });
    } catch (error) {
      console.error('칭호 변경 실패:', error);
      
      // 현재 로그인한 사용자 정보가 있으면 해당 정보 사용
      const currentUserId = getCurrentUserId();
      const actualUserId = currentUserId || userId;
      
      // Mock 처리
      const userIndex = mockUsers.findIndex(u => u.id === actualUserId);
      
      if (userIndex !== -1) {
        mockUsers[userIndex].title = title;
      }
    }
    return Promise.resolve();
  }
};

export default userService; 