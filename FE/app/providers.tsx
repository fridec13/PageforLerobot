'use client';

import { ReactNode, useEffect } from 'react';
import { loadUserProfile, useAuthStore } from '@/lib/auth';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // 앱이 로드될 때 인증 상태 초기화
  useEffect(() => {
    const loadUserData = async () => {
      // 현재 경로가 /profile인 경우 불필요한 API 호출을 방지
      if (typeof window !== 'undefined' && window.location.pathname.includes('/profile')) {
        console.log('프로필 페이지에서는 자동 사용자 정보 로드 스킵');
        return;
      }
      
      await loadUserProfile();
    };
    
    // 토큰이 있으면 사용자 정보 로드
    if (useAuthStore.getState().token) {
      loadUserData();
    }
  }, []);

  return <>{children}</>;
} 