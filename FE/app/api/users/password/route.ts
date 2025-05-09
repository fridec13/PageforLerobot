import { NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data/users-data';

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
    const { currentPassword, newPassword } = requestData;
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: '현재 비밀번호와 새 비밀번호가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 사용자 존재 확인
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 실제 환경에서는 비밀번호 해시 비교
    // 여기서는 Mock이므로 현재 비밀번호 검증은 생략 (실제로는 필요)
    
    // 비밀번호 변경 (실제 환경에서는 해시 처리 필요)
    // mockUsers[userIndex].password = newPassword;
    
    return NextResponse.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });
    
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    return NextResponse.json(
      { success: false, error: '비밀번호 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 