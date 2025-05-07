'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // 인증 상태 확인
    if (!isLoading && !isAuthenticated && pathname !== '/auth/login' && pathname !== '/auth/register') {
      // 로그인 페이지로 리디렉션하면서 원래 가려던 경로를 쿼리 파라미터로 전달
      router.push(`/auth/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // 로딩 중이거나 인증이 필요한 페이지인데 인증되지 않은 경우 로딩 UI 또는 빈 화면 표시
  if (isLoading || (!isAuthenticated && pathname !== '/auth/login' && pathname !== '/auth/register')) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 인증된 사용자이거나 로그인/회원가입 페이지인 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
} 