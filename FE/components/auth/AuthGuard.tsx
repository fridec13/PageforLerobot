'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
  fallback?: ReactNode | null;
}

/**
 * 인증 및 권한을 관리하는 컴포넌트
 * @param requireAuth - 인증이 필요한지 여부 (기본값: true)
 * @param allowedRoles - 허용된 역할 목록 (없으면 모든 인증된 사용자 허용)
 * @param redirectTo - 인증되지 않았을 때 리디렉션할 경로 (기본값: /auth/login)
 * @param fallback - 인증 로딩 중 또는 권한이 없을 때 표시할 컴포넌트
 */
export function AuthGuard({ 
  children, 
  requireAuth = true,
  allowedRoles,
  redirectTo = '/auth/login',
  fallback = null 
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuth();

  // 현재 경로가 인증 관련 페이지인지 확인
  const isAuthPage = pathname?.startsWith('/auth/');

  useEffect(() => {
    // 인증 요구 사항 확인이 완료된 후에만 처리
    if (!isLoading) {
      // 인증이 필요하고 인증되지 않은 경우
      if (requireAuth && !isAuthenticated && !isAuthPage) {
        // 리디렉션 경로에 현재 경로 정보를 쿼리 파라미터로 추가
        router.push(`${redirectTo}?returnUrl=${encodeURIComponent(pathname || '/')}`);
      }
      
      // 이미 인증되었는데 인증 페이지에 접근하는 경우 홈으로 리디렉션
      if (isAuthenticated && isAuthPage) {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, requireAuth, redirectTo, isAuthPage]);

  // 권한 검사 (역할 기반)
  const hasRequiredRole = !allowedRoles || 
    (user?.role && allowedRoles.includes(user.role));

  // 로딩 중이거나 인증/권한 검사 실패 시 폴백 UI 표시
  if (isLoading || (requireAuth && !isAuthenticated) || (isAuthenticated && !hasRequiredRole)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[50vh]">
        {isLoading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        ) : !isAuthenticated ? (
          <p className="text-muted-foreground">인증이 필요합니다...</p>
        ) : (
          <div className="text-center">
            <p className="text-red-500 font-medium mb-2">접근 권한이 없습니다</p>
            <p className="text-sm text-muted-foreground">
              이 페이지를 보려면 더 높은 권한이 필요합니다.
            </p>
            <button 
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
            >
              이전 페이지로 돌아가기
            </button>
          </div>
        )}
      </div>
    );
  }

  // 모든 검사를 통과하면 자식 컴포넌트 렌더링
  return <>{children}</>;
} 