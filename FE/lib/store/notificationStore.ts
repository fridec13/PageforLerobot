import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  link?: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  
  // 알림 추가
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  
  // 알림을 읽음으로 표시
  markAsRead: (id: string) => void;
  
  // 모든 알림을 읽음으로 표시
  markAllAsRead: () => void;
  
  // 알림 삭제
  removeNotification: (id: string) => void;
  
  // 모든 알림 삭제
  clearAllNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      
      addNotification: (notification) => {
        const id = Date.now().toString();
        const newNotification: Notification = {
          ...notification,
          id,
          createdAt: new Date(),
          isRead: false
        };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1
        }));
        
        // 브라우저 알림 API 사용 (지원되는 경우)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message
          });
        }
      },
      
      markAsRead: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.map((notification) => {
            if (notification.id === id && !notification.isRead) {
              return { ...notification, isRead: true };
            }
            return notification;
          });
          
          const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
          
          return {
            notifications: updatedNotifications,
            unreadCount
          };
        });
      },
      
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            isRead: true
          })),
          unreadCount: 0
        }));
      },
      
      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          const unreadDelta = notification && !notification.isRead ? -1 : 0;
          
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: Math.max(0, state.unreadCount + unreadDelta)
          };
        });
      },
      
      clearAllNotifications: () => {
        set({
          notifications: [],
          unreadCount: 0
        });
      }
    }),
    {
      name: 'notifications-storage',
      partialize: (state) => ({ 
        notifications: state.notifications,
        unreadCount: state.unreadCount 
      })
    }
  )
);

// 브라우저 알림 권한 요청 함수
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('이 브라우저는 알림을 지원하지 않습니다.');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}; 