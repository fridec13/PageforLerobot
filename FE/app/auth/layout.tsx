'use client';

import { initializeAuth } from '@/lib/store/authStore';
import { useEffect } from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  // 인증 상태 초기화
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50 p-4">
      {children}
    </div>
  );
} 