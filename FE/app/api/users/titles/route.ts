import { NextResponse } from 'next/server';
import { mockTitles } from '@/lib/mock-data/users-data';

export async function GET(request: Request) {
  try {
    // 권한 확인 (헤더에서 토큰 추출) - 칭호 조회는 인증 없이도 가능하도록 설정 가능
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: mockTitles
    });
    
  } catch (error) {
    console.error('칭호 목록 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '칭호 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 