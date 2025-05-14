"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, MessageSquare } from "lucide-react"
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Button } from "@/components/ui/button"
import userService, { UserMessage } from "@/lib/services/userService"
import { useAuth } from "@/lib/auth"

export default function MessagesPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [messages, setMessages] = useState<UserMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    // 인증되지 않은 경우 또는 로딩 중인 경우에는 메시지를 로드하지 않음
    if (authLoading) return
    
    if (!isAuthenticated) {
      router.push("/auth/login?returnUrl=/profile/messages")
      return
    }
    
    const loadMessages = async () => {
      try {
        setIsLoading(true)
        const response = await userService.getMyMessages(page, 10)
        setMessages(response.items)
        setTotalPages(response.totalPages)
      } catch (error) {
        console.error('메시지 로딩 오류:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadMessages()
  }, [isAuthenticated, authLoading, router, page])

  // 메시지 읽음 처리
  const handleMarkAsRead = async (messageId: string) => {
    if (!isAuthenticated || !user?.id) return
    
    try {
      await userService.markMessageAsRead(messageId)
      setMessages(prev => 
        prev.map(msg => msg.id === messageId ? { ...msg, read: true } : msg)
      )
    } catch (error) {
      console.error('메시지 읽음 처리 오류:', error)
    }
  }
  
  // 메시지 삭제
  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm("이 메시지를 삭제하시겠습니까?")) return;
    
    try {
      await userService.deleteMessage(messageId)
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
    } catch (error) {
      console.error('메시지 삭제 오류:', error)
      alert('메시지 삭제에 실패했습니다.')
    }
  }

  // 조건부 반환은 모든 Hook 선언 후에 배치해야 함
  if (authLoading) {
    return <div className="flex justify-center items-center h-64">로그인 정보 확인 중...</div>
  }
  
  // 로그인하지 않은 경우 로딩 상태 표시 (리다이렉트는 useEffect에서 처리)
  if (!isAuthenticated) {
    return <div className="flex justify-center items-center h-64">로그인 페이지로 이동 중...</div>
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 뒤로 가기 */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/profile">
            <ChevronLeft className="h-4 w-4 mr-1" />
            프로필로 돌아가기
          </Link>
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <MessageSquare className="h-6 w-6 mr-2" />
        메시지 수신함
      </h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-10">
              <p>메시지를 불러오는 중...</p>
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`border rounded-lg p-4 ${!message.read ? 'bg-blue-50 border-blue-200' : ''}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium flex items-center">
                      {!message.read && (
                        <span className="h-2 w-2 bg-blue-500 rounded-full mr-2" />
                      )}
                      {message.senderName}님으로부터의 메시지
                    </h3>
                    <span className="text-sm text-gray-500">
                      {format(new Date(message.createdAt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                    </span>
                  </div>
                  <p className="text-gray-700 my-3 whitespace-pre-line">
                    {message.content}
                  </p>
                  <div className="flex justify-between items-center">
                    {!message.read && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleMarkAsRead(message.id)}
                      >
                        읽음으로 표시
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteMessage(message.id)}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>받은 메시지가 없습니다.</p>
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              <Button 
                variant="outline" 
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                이전
              </Button>
              <span className="flex items-center px-4">
                {page} / {totalPages}
              </span>
              <Button 
                variant="outline" 
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
              >
                다음
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 