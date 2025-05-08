import { NextResponse } from 'next/server';
import { mockMessages, mockUsers } from '@/lib/mock-data/users-data';

export async function GET(request: Request) {
  try {
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
    
    // URL에서 페이지 및 제한 매개변수 추출
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '10');
    
    // 사용자에게 온 메시지 필터링
    const userMessages = mockMessages
      .filter(msg => msg.receiverId === userId)
      .map(msg => {
        const sender = mockUsers.find(u => u.id === msg.senderId);
        return {
          id: msg.id,
          senderId: msg.senderId,
          senderName: sender?.name || '알 수 없음',
          content: msg.content,
          read: msg.read,
          createdAt: msg.createdAt
        };
      });
    
    // 페이지네이션 적용
    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    const paginatedMessages = userMessages.slice(startIdx, endIdx);
    
    return NextResponse.json({
      success: true,
      data: {
        items: paginatedMessages,
        total: userMessages.length,
        page,
        limit,
        totalPages: Math.ceil(userMessages.length / limit)
      }
    });
    
  } catch (error) {
    console.error('메시지 목록 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '메시지 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 메시지 전송 API
export async function POST(request: Request) {
  try {
    // 권한 확인
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const senderId = token;
    
    // 메시지 데이터 추출
    const { receiverId, content } = await request.json();
    
    if (!receiverId || !content) {
      return NextResponse.json(
        { success: false, error: '수신자와 내용을 모두 입력해주세요.' },
        { status: 400 }
      );
    }
    
    // 수신자가 존재하는지 확인
    const receiver = mockUsers.find(u => u.id === receiverId);
    if (!receiver) {
      return NextResponse.json(
        { success: false, error: '존재하지 않는 수신자입니다.' },
        { status: 404 }
      );
    }
    
    // 새 메시지 생성
    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId,
      receiverId,
      content,
      read: false,
      createdAt: new Date()
    };
    
    // 메시지 저장 (메모리에만 임시 저장)
    mockMessages.push(newMessage);
    
    return NextResponse.json({
      success: true,
      data: {
        message: '메시지가 전송되었습니다.',
        id: newMessage.id
      }
    });
    
  } catch (error) {
    console.error('메시지 전송 오류:', error);
    return NextResponse.json(
      { success: false, error: '메시지 전송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 