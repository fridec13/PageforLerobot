import { NextResponse } from 'next/server';
import { mockMessages } from '@/lib/mock-data/users-data';

interface Params {
  params: {
    id: string;
  };
}

// 특정 메시지 조회
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;
    
    // 권한 확인
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const userId = token;
    
    // 메시지 조회
    const message = mockMessages.find(msg => 
      msg.id === id && (msg.receiverId === userId || msg.senderId === userId)
    );
    
    if (!message) {
      return NextResponse.json(
        { success: false, error: '메시지를 찾을 수 없거나 접근 권한이 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: message
    });
    
  } catch (error) {
    console.error('메시지 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '메시지 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 메시지 읽음 표시
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = params;
    
    // 권한 확인
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const userId = token;
    
    // 메시지 찾기
    const messageIndex = mockMessages.findIndex(msg => 
      msg.id === id && msg.receiverId === userId
    );
    
    if (messageIndex === -1) {
      return NextResponse.json(
        { success: false, error: '메시지를 찾을 수 없거나 접근 권한이 없습니다.' },
        { status: 404 }
      );
    }
    
    // 메시지를 읽음으로 표시
    mockMessages[messageIndex].read = true;
    
    return NextResponse.json({
      success: true,
      data: {
        message: '메시지가 읽음으로 표시되었습니다.'
      }
    });
    
  } catch (error) {
    console.error('메시지 읽음 표시 오류:', error);
    return NextResponse.json(
      { success: false, error: '메시지 읽음 표시 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 메시지 삭제
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = params;
    
    // 권한 확인
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const userId = token;
    
    // 삭제할 메시지 인덱스 찾기
    const messageIndex = mockMessages.findIndex(msg => 
      msg.id === id && msg.receiverId === userId
    );
    
    if (messageIndex === -1) {
      return NextResponse.json(
        { success: false, error: '메시지를 찾을 수 없거나 접근 권한이 없습니다.' },
        { status: 404 }
      );
    }
    
    // 메시지 삭제 (실제로는 배열에서 제거)
    mockMessages.splice(messageIndex, 1);
    
    return NextResponse.json({
      success: true,
      data: {
        message: '메시지가 삭제되었습니다.'
      }
    });
    
  } catch (error) {
    console.error('메시지 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: '메시지 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 