import { NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data/users-data';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // 유효성 검사
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }
    
    // Mock 인증 로직
    const user = mockUsers.find(u => u.email === email);
    
    if (user && password === '1234') { // 모든 사용자의 비밀번호는 1234로 가정
      // 비밀번호는 응답에서 제외
      const userWithoutSensitiveData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        image: user.image,
        contribution: user.contribution,
        badges: user.badges
      };
      
      return NextResponse.json({
        success: true,
        data: {
          user: userWithoutSensitiveData,
          token: user.id // 간단한 토큰 구현
        }
      });
    }
    
    // 인증 실패
    return NextResponse.json(
      { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    );
    
  } catch (error) {
    console.error('로그인 처리 오류:', error);
    return NextResponse.json(
      { success: false, error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 