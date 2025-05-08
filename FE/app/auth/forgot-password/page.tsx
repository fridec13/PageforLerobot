'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import apiClient from '@/lib/services/apiClient';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 간단한 폼 유효성 검사
    if (!email) {
      setValidationError('이메일을 입력해주세요.');
      return;
    }
    
    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('올바른 이메일 형식이 아닙니다.');
      return;
    }
    
    setValidationError('');
    setIsLoading(true);
    
    try {
      // 실제 API 연동 시 이 부분을 사용
      const response = await apiClient.post('/api/auth/forgot-password', { email });
      
      if (response.data.success) {
        setIsSuccess(true);
      } else {
        setValidationError(response.data.error || '비밀번호 재설정 요청 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      setValidationError(error.response?.data?.error || '서버 연결 중 오류가 발생했습니다.');
      console.error('Password reset request error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex flex-col items-center mb-6">
              <Image 
                src="/logo.svg" 
                alt="RoboSSAFYens 로고" 
                width={80} 
                height={80}
                priority
              />
            </div>
            <CardTitle className="text-2xl font-bold text-center">이메일 발송 완료</CardTitle>
            <CardDescription className="text-center">
              비밀번호 재설정 링크가 이메일로 발송되었습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4">
              <p className="mb-4">
                <span className="font-bold">{email}</span>로 비밀번호 재설정 링크를 보냈습니다.
                메일함을 확인해주세요.
              </p>
              <p className="text-sm text-muted-foreground">
                만약 이메일을 받지 못했다면, 스팸함을 확인하거나 다시 시도해주세요.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              onClick={() => router.push('/auth/login')} 
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              로그인 페이지로 돌아가기
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex flex-col items-center mb-6">
            <Image 
              src="/logo.svg" 
              alt="RoboSSAFYens 로고" 
              width={80} 
              height={80}
              priority
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">비밀번호 찾기</CardTitle>
          <CardDescription className="text-center">
            가입 시 사용한 이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {validationError}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="가입 시 사용한 이메일"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  처리 중...
                </span>
              ) : (
                '비밀번호 재설정 링크 받기'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <div className="text-sm">
            <Link href="/auth/login" className="text-blue-500 hover:underline">
              로그인 페이지로 돌아가기
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
} 