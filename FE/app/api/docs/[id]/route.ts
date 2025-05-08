import { NextRequest, NextResponse } from 'next/server';
import * as docsService from '@/lib/services/docsService';

/**
 * GET /api/docs/[id]
 * 특정 문서 조회 API
 */
export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const document = await docsService.getDocumentById(id);
    
    if (!document) {
      return NextResponse.json(
        { 
          success: false,
          error: '문서를 찾을 수 없습니다.' 
        },
        { status: 404 }
      );
    }
    
    // 문서 이력 정보도 함께 조회 (쿼리 파라미터로 조건부 조회)
    const searchParams = request.nextUrl.searchParams;
    const includeHistory = searchParams.get('includeHistory') === 'true';
    
    if (includeHistory) {
      const history = await docsService.getDocumentHistory(id);
      return NextResponse.json({
        success: true,
        data: { document, history }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: { document }
    });
  } catch (error) {
    console.error('문서 조회 오류:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '문서를 조회하는 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/docs/[id]
 * 문서 수정 API
 */
export async function PUT(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, content, userId } = body;
    
    // 필수 필드 검증
    if (!content || !userId) {
      return NextResponse.json(
        { 
          success: false,
          error: '필수 필드가 누락되었습니다.' 
        },
        { status: 400 }
      );
    }
    
    const updatedDocument = await docsService.updateDocument(
      id,
      { title, content },
      userId
    );
    
    if (!updatedDocument) {
      return NextResponse.json(
        { 
          success: false,
          error: '문서를 찾을 수 없습니다.' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: { document: updatedDocument }
    });
  } catch (error) {
    console.error('문서 수정 오류:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '문서를 수정하는 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/docs/[id]/change-request
 * 문서 변경 요청 API
 */
export async function POST(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { proposedContent, userId } = body;
    
    // 필수 필드 검증
    if (!proposedContent || !userId) {
      return NextResponse.json(
        { 
          success: false,
          error: '필수 필드가 누락되었습니다.' 
        },
        { status: 400 }
      );
    }
    
    // 문서 존재 여부 확인
    const document = await docsService.getDocumentById(id);
    if (!document) {
      return NextResponse.json(
        { 
          success: false,
          error: '문서를 찾을 수 없습니다.' 
        },
        { status: 404 }
      );
    }
    
    const changeRequest = await docsService.createChangeRequest(
      id,
      proposedContent,
      userId
    );
    
    return NextResponse.json(
      {
        success: true,
        data: { changeRequest }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('변경 요청 생성 오류:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '변경 요청을 생성하는 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
} 