"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, MessageSquare, AlertCircle, Plus } from "lucide-react"
import wikiService from "@/lib/services/wikiService"
import { Discussion, WikiDocument } from "@/lib/models/wiki"
import { useAuthStore } from "@/lib/store/authStore"

export default function WikiDiscussionPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const slug = params.slug as string
  
  const [document, setDocument] = useState<WikiDocument | null>(null)
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 문서와 토론 정보 불러오기
  useEffect(() => {
    const fetchDocumentAndDiscussions = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // 문서와 토론을 병렬로 가져오기
        const [documentData, discussionsData] = await Promise.all([
          wikiService.getDocumentBySlug(slug),
          wikiService.getDiscussions(slug)
        ])
        
        setDocument(documentData)
        setDiscussions(discussionsData)
        
        // 페이지 제목 설정
        if (typeof window !== 'undefined') {
          window.document.title = `${documentData.title} 토론 - RoboSSAFYens 위키`;
          
          // 헤더 제목 업데이트를 위한 커스텀 이벤트
          window.dispatchEvent(new CustomEvent('updateWikiTitle', {
            detail: { 
              title: `${documentData.title} 토론`,
              categories: []
            }
          }));
        }
      } catch (error: any) {
        console.error(`위키 문서 토론 로드 실패 (${slug}):`, error)
        setError(error.message || "문서 토론을 불러올 수 없습니다.")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDocumentAndDiscussions()
    
    // 컴포넌트 언마운트 시 제목 초기화
    return () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('updateWikiTitle', {
          detail: { 
            title: '',
            categories: []
          }
        }));
      }
    }
  }, [slug])
  
  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // 사용자 이니셜 생성
  const getInitials = (name: string) => {
    if (!name) return "??"
    const names = name.split(" ")
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase()
  }
  
  // 새 토론 시작
  const handleNewDiscussion = () => {
    if (isAuthenticated) {
      router.push(`/wiki/${slug}/discussion/new`)
    } else {
      router.push(`/auth/login?returnUrl=/wiki/${slug}/discussion/new`)
    }
  }
  
  // 특정 토론으로 이동
  const handleGoToDiscussion = (discussionId: string) => {
    router.push(`/wiki/${slug}/discussion/${discussionId}`)
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (error || !document) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>문서 토론을 불러올 수 없습니다</AlertTitle>
        <AlertDescription>{error || "요청하신 문서가 존재하지 않습니다."}</AlertDescription>
      </Alert>
    )
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/wiki/${slug}`)}
          className="flex items-center text-muted-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          문서로 돌아가기
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              문서 토론
            </CardTitle>
            <Button
              variant="default"
              size="sm"
              onClick={handleNewDiscussion}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              새 토론 시작
            </Button>
          </div>
          <CardDescription>
            {document.title} 문서에 대한 토론을 확인하고 참여해보세요.
            {discussions.length > 0 ? ` 총 ${discussions.length}개의 토론이 있습니다.` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {discussions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              이 문서에는 진행 중인 토론이 없습니다.
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={handleNewDiscussion}
                  className="mx-auto"
                >
                  새 토론 시작하기
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <Card 
                  key={discussion.id} 
                  className="cursor-pointer hover:border-blue-200 transition-colors"
                  onClick={() => handleGoToDiscussion(discussion.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{discussion.title}</CardTitle>
                      <Badge
                        variant={
                          discussion.status === 'open'
                            ? 'default'
                            : 'secondary'
                        }
                        className={
                          discussion.status === 'resolved'
                            ? 'bg-green-500 hover:bg-green-600'
                            : undefined
                        }
                      >
                        {discussion.status === 'open'
                          ? '진행 중'
                          : discussion.status === 'resolved'
                          ? '해결됨'
                          : '닫힘'}
                      </Badge>
                    </div>
                    <CardDescription>
                      시작: {formatDate(discussion.createdAt)} · 댓글: {discussion.comments.length}개
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getInitials(discussion.createdBy.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{discussion.createdBy.username}</p>
                        {discussion.createdBy.title && (
                          <p className="text-xs text-muted-foreground">{discussion.createdBy.title}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 