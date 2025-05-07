'use client';

import { ReactNode, useEffect } from 'react';
import { initializeAuth } from '@/lib/store/authStore';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // 앱이 로드될 때 인증 상태 초기화
  useEffect(() => {
    initializeAuth();
  }, []);

  return <>{children}</>;
} 