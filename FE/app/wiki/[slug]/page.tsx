"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Edit, History, MessageSquare } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuthStore } from "@/lib/store/authStore"
import wikiService from "@/lib/services/wikiService"
import { WikiDocument } from "@/lib/models/wiki"

// 레이아웃에 문서 제목을 전달하기 위한 커스텀 이벤트
declare global {
  interface WindowEventMap {
    'updateWikiTitle': CustomEvent<{ title: string; categories: { id: string; name: string; slug?: string }[] }>;
  }
}

export default function WikiDocumentPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useAuthStore()
  const slug = params.slug as string
  
  const [document, setDocument] = useState<WikiDocument | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 문서 정보 가져오기 및 레이아웃에 제목 전달
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const documentData = await wikiService.getDocumentBySlug(slug)
        setDocument(documentData)
        
        // 레이아웃에 문서 제목 전달
        if (typeof window !== 'undefined') {
          window.document.title = `${documentData.title} - RoboSSAFYens 위키`;

          // 헤더 제목 업데이트를 위한 커스텀 이벤트
          window.dispatchEvent(new CustomEvent('updateWikiTitle', {
            detail: { 
              title: documentData.title,
              categories: documentData.categories
            }
          }));
        }
        
      } catch (error: any) {
        console.error(`위키 문서 로드 실패 (${slug}):`, error)
        setError(error.message || "문서를 불러올 수 없습니다.")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDocument()

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
  
  // 문서 편집 페이지로 이동
  const handleEdit = () => {
    if (isAuthenticated) {
      router.push(`/wiki/${slug}/edit`)
    } else {
      router.push(`/auth/login?returnUrl=/wiki/${slug}/edit`)
    }
  }
  
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
        <AlertTitle>문서를 찾을 수 없습니다</AlertTitle>
        <AlertDescription>
          <p>{error || "요청하신 문서가 존재하지 않습니다."}</p>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => router.push("/wiki")}
              className="mr-2"
            >
              위키 홈으로
            </Button>
            {isAuthenticated && (
              <Button onClick={() => router.push(`/wiki/create?slug=${slug}`)}>
                이 제목으로 문서 만들기
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    )
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-sm text-muted-foreground space-x-4">
            <span>최초 작성: {formatDate(document.createdAt)}</span>
            <Separator orientation="vertical" className="h-4" />
            <span>최근 수정: {formatDate(document.updatedAt)}</span>
            <Separator orientation="vertical" className="h-4" />
            <span>조회수: {document.viewCount}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              편집
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/wiki/${slug}/history`)}
              className="flex items-center"
            >
              <History className="h-4 w-4 mr-2" />
              역사
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/wiki/${slug}/discussion`)}
              className="flex items-center"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              토론
            </Button>
          </div>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-blue max-w-none dark:prose-invert">
            {/* 실제로는 마크다운 렌더링 라이브러리 사용 */}
            <div className="whitespace-pre-wrap">{document.content}</div>
          </div>
        </CardContent>
      </Card>
      
      <Separator className="my-6" />
      
      <div className="text-sm text-muted-foreground">
        <p>
          이 문서는 {formatDate(document.createdAt)}에 {document.createdBy.username}님이 처음 작성했으며,
          {formatDate(document.updatedAt)}에 {document.lastModifiedBy.username}님이 마지막으로 수정했습니다.
        </p>
        <p className="mt-1">
          RoboSSAFYens 위키의 모든 문서는 지속적으로 업데이트되며, 누구나 기여할 수 있습니다.
        </p>
      </div>
    </div>
  )
} 