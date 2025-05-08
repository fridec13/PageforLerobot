import { NextRequest, NextResponse } from 'next/server';
import * as docsService from '@/lib/services/docsService';

/**
 * GET /api/docs
 * 문서 목록 조회 API
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryPath = searchParams.get('category');
    
    let documents;
    
    if (categoryPath) {
      documents = await docsService.getDocumentsByCategory(categoryPath);
    } else {
      documents = await docsService.getAllDocuments();
    }
    
    return NextResponse.json({
      success: true,
      data: { documents }
    });
  } catch (error) {
    console.error('문서 목록 조회 오류:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '문서 목록을 조회하는 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/docs
 * 문서 생성 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, path, categoryId, userId } = body;
    
    // 필수 필드 검증
    if (!title || !content || !path || !categoryId || !userId) {
      return NextResponse.json(
        { 
          success: false,
          error: '필수 필드가 누락되었습니다.' 
        },
        { status: 400 }
      );
    }
    
    const newDocument = await docsService.createDocument(
      { title, content, path, categoryId },
      userId
    );
    
    return NextResponse.json(
      { 
        success: true,
        data: { document: newDocument } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('문서 생성 오류:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '문서를 생성하는 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
} 