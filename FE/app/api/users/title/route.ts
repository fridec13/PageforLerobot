import { NextResponse } from 'next/server';
import { mockUsers, mockTitles } from '@/lib/mock-data/users-data';

export async function POST(request: Request) {
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
    const { title } = requestData;
    
    if (!title) {
      return NextResponse.json(
        { success: false, error: '칭호가 지정되지 않았습니다.' },
        { status: 400 }
      );
    }
    
    // 칭호 유효성 검사
    if (!mockTitles.includes(title)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 칭호입니다.' },
        { status: 400 }
      );
    }
    
    // 사용자 찾기
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 칭호 변경
    mockUsers[userIndex].title = title;
    
    return NextResponse.json({
      success: true,
      message: '칭호가 성공적으로 변경되었습니다.',
      data: {
        title: mockUsers[userIndex].title
      }
    });
    
  } catch (error) {
    console.error('칭호 변경 오류:', error);
    return NextResponse.json(
      { success: false, error: '칭호 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 