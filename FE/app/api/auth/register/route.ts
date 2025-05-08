import { NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data/users-data';
import { ROLES, TITLES } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const { name, email, password, confirmPassword } = await request.json();
    
    // 유효성 검사
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }
    
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: '비밀번호가 일치하지 않습니다.' },
        { status: 400 }
      );
    }
    
    // 이메일 중복 검사
    const existingUser = mockUsers.find(user => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      );
    }
    
    // 새 사용자 생성 (실제 저장은 안됨, 메모리에만 임시 저장)
    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      role: ROLES.USER,
      title: TITLES.NEWCOMER.name,
      image: `https://api.dicebear.com/7.x/lorelei/svg?seed=${Date.now()}`,
      contribution: 0,
      badges: [],
      createdAt: new Date()
    };
    
    // 실제 환경에서는 DB에 저장 필요
    // mockUsers.push(newUser); // 실제로는 메모리에만 저장되며, 앱 재시작 시 사라짐
    
    return NextResponse.json({
      success: true,
      data: { 
        message: '회원가입이 완료되었습니다. 로그인해주세요.' 
      }
    });
    
  } catch (error) {
    console.error('회원가입 처리 오류:', error);
    return NextResponse.json(
      { success: false, error: '회원가입 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 