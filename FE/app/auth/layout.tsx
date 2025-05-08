'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { initializeAuth } from '@/lib/auth';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 인증 상태 초기화
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="relative flex min-h-screen items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        {/* 배경 장식 - 왼쪽 */}
        <div className="hidden lg:block absolute left-0 top-0 h-full w-1/4">
          <div className="absolute left-12 top-1/4 w-32 h-32 rounded-full bg-blue-100 opacity-60"></div>
          <div className="absolute left-24 top-1/2 w-16 h-16 rounded-full bg-blue-200 opacity-40"></div>
          <div className="absolute left-8 bottom-1/4 w-24 h-24 rounded-full bg-blue-100 opacity-50"></div>
        </div>
        
        {/* 배경 장식 - 오른쪽 */}
        <div className="hidden lg:block absolute right-0 top-0 h-full w-1/4">
          <div className="absolute right-12 top-1/3 w-32 h-32 rounded-full bg-blue-100 opacity-60"></div>
          <div className="absolute right-24 bottom-1/3 w-16 h-16 rounded-full bg-blue-200 opacity-40"></div>
          <div className="absolute right-8 bottom-1/4 w-24 h-24 rounded-full bg-blue-100 opacity-50"></div>
        </div>
        
        {/* 메인 콘텐츠 */}
        <div className="w-full max-w-md space-y-8 mt-0">
          {children}
        </div>
      </div>
    </div>
  );
} 