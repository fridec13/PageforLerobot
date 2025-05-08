'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';
import apiClient from '@/lib/services/apiClient';

// 라우터를 사용하는 컴포넌트를 분리
function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { isAuthenticated, error, clearError } = useAuthStore();

  // 이미 로그인한 경우 홈으로 리디렉션
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    // 유효성 검사
    if (!username || !email || !password || !confirmPassword) {
      setValidationError('모든 필드를 입력해주세요.');
      return;
    }
    
    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('올바른 이메일 형식이 아닙니다.');
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
    
    // 약관 동의 검사
    if (!termsAccepted) {
      setValidationError('이용약관에 동의해주세요.');
      return;
    }
    
    setValidationError('');
    setIsLoading(true);
    
    // 회원가입 시도
    try {
      const response = await apiClient.post('/api/auth/register', {
        name: username,
        email,
        password,
        confirmPassword
      });
      
      if (response.data.success) {
        // 회원가입 성공 메시지와 함께 로그인 페이지로 이동
        router.push('/auth/login?registered=true');
      } else {
        setValidationError(response.data.error || '회원가입 처리 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      setValidationError(error.response?.data?.error || '회원가입 중 오류가 발생했습니다.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
          <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
          <CardDescription className="text-center">
            RoboSSAFYens에 가입하여 로봇 지식 공유 커뮤니티에 참여하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || validationError) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {validationError || error}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">사용자 이름</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="사용자 이름을 입력하세요"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
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
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                <span>
                  <Link href="/terms" className="text-blue-500 hover:underline">이용약관</Link>과{' '}
                  <Link href="/privacy" className="text-blue-500 hover:underline">개인정보 처리방침</Link>에 동의합니다.
                </span>
              </label>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  가입 중...
                </span>
              ) : (
                '회원가입'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <div className="text-sm">
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/login" className="text-blue-500 hover:underline">
              로그인
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// 메인 컴포넌트에서 Suspense로 감싸기
export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
} 