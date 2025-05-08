'use client';

import { ReactNode } from 'react';
import { AuthGuard } from './AuthGuard';

interface RequireAuthProps {
  children: ReactNode;
  roles?: string[];
  redirectTo?: string;
  fallback?: ReactNode | null;
}

/**
 * @deprecated AuthGuard 컴포넌트를 사용하세요
 */
export default function RequireAuth({
  children,
  roles,
  redirectTo = '/auth/login',
  fallback = null,
}: RequireAuthProps) {
  // AuthGuard로 기능 위임
  return (
    <AuthGuard
      requireAuth={true}
      allowedRoles={roles}
      redirectTo={redirectTo}
      fallback={fallback}
    >
      {children}
    </AuthGuard>
  );
} 