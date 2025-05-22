'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/auth';
import apiClient from '@/lib/services/apiClient';

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  // 로그인 되어있지 않다면 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?returnUrl=/auth/change-password');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 폼 유효성 검사
    if (!currentPassword || !newPassword || !confirmPassword) {
      setValidationError('모든 필드를 입력해주세요.');
      return;
    }
    
    // 새 비밀번호 일치 검사
    if (newPassword !== confirmPassword) {
      setValidationError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    
    // 비밀번호 강도 검사
    if (newPassword.length < 8) {
      setValidationError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    
    // 현재 비밀번호와 새 비밀번호가 같은지 검사
    if (currentPassword === newPassword) {
      setValidationError('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
      return;
    }
    
    setValidationError('');
    setIsLoading(true);
    
    try {
      // 비밀번호 변경 API 호출
      const response = await apiClient.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      
      if (response.data.success) {
        setIsSuccess(true);
      } else {
        setValidationError(response.data.error || '비밀번호 변경 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      setValidationError(error.response?.data?.error || '서버 연결 중 오류가 발생했습니다.');
      console.error('Password change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
                새 비밀번호로 다음 로그인부터 사용할 수 있습니다.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              onClick={() => router.push('/profile')} 
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              프로필로 돌아가기
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
          <CardTitle className="text-2xl font-bold text-center">비밀번호 변경</CardTitle>
          <CardDescription className="text-center">
            안전한 계정 관리를 위해 주기적으로 비밀번호를 변경해주세요.
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
              <Label htmlFor="currentPassword">현재 비밀번호</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호를 입력하세요"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호를 입력하세요"
                required
              />
              <p className="text-xs text-muted-foreground">
                비밀번호는 8자 이상이어야 합니다.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호를 다시 입력하세요"
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
            <Link href="/profile" className="text-blue-500 hover:underline">
              프로필로 돌아가기
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ChangePasswordForm />
    </Suspense>
  );
} 