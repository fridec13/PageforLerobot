import { NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data/users-data';

export async function GET(request: Request) {
  try {
    // 권한 확인 (헤더에서 토큰 추출)
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7); // 'Bearer ' 이후의 토큰 값
    
    // 토큰을 사용자 ID로 간주 (실제 환경에서는 JWT 등으로 검증 필요)
    const userId = token;
    
    // 사용자 정보 조회
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 민감한 정보 제외하고 반환
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      image: user.image,
      contribution: user.contribution,
      badges: user.badges,
      createdAt: user.createdAt
    };
    
    return NextResponse.json({
      success: true,
      data: userProfile
    });
    
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '사용자 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 