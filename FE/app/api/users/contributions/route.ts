import { NextResponse } from 'next/server';
import { mockContributions } from '@/lib/mock-data/users-data';

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
    
    const token = authHeader.substring(7);
    const userId = token;
    
    // 페이지네이션 파라미터 가져오기
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // 유효한 페이지 번호와 제한 확인
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 페이지 파라미터입니다.' },
        { status: 400 }
      );
    }
    
    // 사용자 ID에 따라 필터링
    const userContributions = mockContributions.filter(contrib => contrib.userId === userId);
    const totalContributions = userContributions.length;
    
    // 페이지네이션 계산
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    // 최신순 정렬 후 페이지네이션 적용
    const paginatedContributions = userContributions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(startIndex, endIndex);
    
    return NextResponse.json({
      success: true,
      data: {
        items: paginatedContributions,
        total: totalContributions,
        page,
        limit,
        totalPages: Math.ceil(totalContributions / limit)
      }
    });
    
  } catch (error) {
    console.error('기여 내역 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '기여 내역 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 