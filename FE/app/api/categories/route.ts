import { NextRequest, NextResponse } from 'next/server';
import * as docsService from '@/lib/services/docsService';

/**
 * GET /api/categories
 * 모든 카테고리 조회 API
 */
export async function GET(_request: NextRequest) {
  try {
    const categories = await docsService.getAllCategories();
    
    return NextResponse.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('카테고리 목록 조회 오류:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '카테고리 목록을 조회하는 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
} 