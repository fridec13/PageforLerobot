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

export async function PATCH(request: Request) {
  try {
    // 권한 확인 (헤더에서 토큰 추출)
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const userId = token;
    
    // 요청 본문 파싱
    const requestData = await request.json();
    const { name, email, title, image } = requestData;
    
    // 사용자 정보 업데이트
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 요청된 필드만 업데이트
    if (name) mockUsers[userIndex].name = name;
    if (email) mockUsers[userIndex].email = email;
    if (title) mockUsers[userIndex].title = title;
    if (image) mockUsers[userIndex].image = image;
    
    // 업데이트된 사용자 정보 반환
    const updatedUser = {
      id: mockUsers[userIndex].id,
      name: mockUsers[userIndex].name,
      email: mockUsers[userIndex].email,
      role: mockUsers[userIndex].role,
      title: mockUsers[userIndex].title,
      image: mockUsers[userIndex].image,
      contribution: mockUsers[userIndex].contribution,
      badges: mockUsers[userIndex].badges,
      createdAt: mockUsers[userIndex].createdAt
    };
    
    return NextResponse.json({
      success: true,
      data: updatedUser
    });
    
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    return NextResponse.json(
      { success: false, error: '프로필 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 