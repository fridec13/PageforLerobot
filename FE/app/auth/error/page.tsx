'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

// 에러 코드와 메시지 매핑
const errorMessages: Record<string, string> = {
  Configuration: '서버 설정 오류가 발생했습니다.',
  AccessDenied: '접근이 거부되었습니다. 권한이 없습니다.',
  Verification: '인증 링크가 만료되었거나 이미 사용되었습니다.',
  OAuthSignin: '소셜 로그인 중 오류가 발생했습니다.',
  OAuthCallback: '소셜 로그인 콜백 중 오류가 발생했습니다.',
  OAuthCreateAccount: '소셜 계정 생성 중 오류가 발생했습니다.',
  EmailCreateAccount: '이메일 계정 생성 중 오류가 발생했습니다.',
  Callback: '콜백 처리 중 오류가 발생했습니다.',
  OAuthAccountNotLinked: '이미 다른 방식으로 로그인한 이메일입니다.',
  EmailSignin: '이메일 링크 전송 중 오류가 발생했습니다.',
  CredentialsSignin: '로그인에 실패했습니다. 정보를 확인해주세요.',
  SessionRequired: '이 페이지는 로그인이 필요합니다.',
  Default: '인증 중 오류가 발생했습니다.',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [errorType, setErrorType] = useState<string>('Default');

  useEffect(() => {
    const error = searchParams.get('error');
    if (error && Object.keys(errorMessages).includes(error)) {
      setErrorType(error);
    }
  }, [searchParams]);

  return (
    <div className="flex justify-center items-center min-h-[70vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">인증 오류</CardTitle>
          <CardDescription className="text-center">
            {errorMessages[errorType]}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col gap-4">
          <Link href="/auth/login">
            <Button className="w-full">로그인 페이지로 돌아가기</Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="w-full">홈으로 이동</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
} 