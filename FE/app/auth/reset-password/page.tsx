'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import apiClient from '@/lib/services/apiClient';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [isValidating, setIsValidating] = useState(true);

  // 토큰 유효성 검사
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        setIsValidating(false);
        return;
      }

      try {
        // 토큰 유효성 검사 API 호출
        const response = await apiClient.get(`/api/auth/validate-reset-token?token=${token}`);
        
        // 토큰이 유효하지 않으면
        if (!response.data.success) {
          setIsTokenValid(false);
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setIsTokenValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 폼 유효성 검사
    if (!password || !confirmPassword) {
      setValidationError('모든 필드를 입력해주세요.');
      return;
    }
    
    // 비밀번호 일치 검사
    if (password !== confirmPassword) {
      setValidationError('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    // 비밀번호 강도 검사
    if (password.length < 8) {
      setValidationError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    
    setValidationError('');
    setIsLoading(true);
    
    try {
      // 비밀번호 변경 API 호출
      const response = await apiClient.post('/api/auth/reset-password', {
        token,
        password,
        confirmPassword
      });
      
      if (response.data.success) {
        setIsSuccess(true);
      } else {
        setValidationError(response.data.error || '비밀번호 변경 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      setValidationError(error.response?.data?.error || '서버 연결 중 오류가 발생했습니다.');
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 상태
  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 토큰이 유효하지 않은 경우
  if (!isTokenValid) {
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
            <CardTitle className="text-2xl font-bold text-center">링크가 유효하지 않습니다</CardTitle>
            <CardDescription className="text-center">
              비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4">
              <p className="mb-4">
                새로운 비밀번호 재설정 링크를 요청해주세요.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              onClick={() => router.push('/auth/forgot-password')} 
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              비밀번호 찾기로 돌아가기
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 비밀번호 변경 성공
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
            <CardTitle className="text-2xl font-bold text-center">비밀번호 변경 완료</CardTitle>
            <CardDescription className="text-center">
              비밀번호가 성공적으로 변경되었습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4">
              <p className="mb-4">
                새 비밀번호로 로그인할 수 있습니다.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              onClick={() => router.push('/auth/login')} 
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              로그인 페이지로 이동
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 비밀번호 재설정 폼
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
          <CardTitle className="text-2xl font-bold text-center">새 비밀번호 설정</CardTitle>
          <CardDescription className="text-center">
            새로운 비밀번호를 입력해주세요.
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
              <Label htmlFor="password">새 비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="새 비밀번호를 입력하세요"
                required
              />
              <p className="text-xs text-muted-foreground">
                비밀번호는 8자 이상이어야 합니다.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
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
                '비밀번호 변경'
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
} 