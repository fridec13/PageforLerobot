"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Edit, History, MessageSquare, ChevronUp } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuthStore } from "@/lib/auth"
import wikiService from "@/lib/services/wikiService"
import { WikiDocument } from "@/lib/models/wiki"
import { parseWikiText } from "@/lib/utils"

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
  const [showTopButton, setShowTopButton] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  
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
  
  // 스크롤 감지 및 Top 버튼 표시
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowTopButton(true);
      } else {
        setShowTopButton(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // 최상단으로 스크롤
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // 각주 기능 설정
  useEffect(() => {
    if (!contentRef.current) return;
    
    // 각주와 미주 클릭 이벤트 처리
    const footnoteRefs = contentRef.current.querySelectorAll('.footnote-ref');
    footnoteRefs.forEach((ref) => {
      ref.addEventListener('click', () => {
        const footnoteId = ref.getAttribute('data-footnote-id');
        if (footnoteId && typeof window !== 'undefined') {
          const footnoteElement = window.document.getElementById(`footnote-${footnoteId}`);
          if (footnoteElement) {
            footnoteElement.scrollIntoView({ behavior: 'smooth' });
            footnoteElement.classList.add('bg-yellow-50');
            setTimeout(() => {
              footnoteElement.classList.remove('bg-yellow-50');
            }, 2000);
          }
        }
      });
    });
    
    // 미주 클릭 이벤트 처리
    const commentRefs = contentRef.current.querySelectorAll('.wiki-comment');
    commentRefs.forEach((ref) => {
      ref.addEventListener('click', () => {
        const commentId = ref.getAttribute('data-comment-id');
        if (commentId && typeof window !== 'undefined') {
          const commentElement = window.document.getElementById(`comment-${commentId}`);
          if (commentElement) {
            commentElement.scrollIntoView({ behavior: 'smooth' });
            commentElement.classList.add('bg-yellow-50');
            setTimeout(() => {
              commentElement.classList.remove('bg-yellow-50');
            }, 2000);
          }
        }
      });
    });
    
    // 각주/미주 참조로 돌아가기 링크 클릭 이벤트
    const backLinks = contentRef.current.querySelectorAll('a[href^="#footnote-ref-"], a[href^="#comment-ref-"]');
    backLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && typeof window !== 'undefined') {
          const refElement = window.document.querySelector(href);
          if (refElement) {
            refElement.scrollIntoView({ behavior: 'smooth' });
            refElement.classList.add('bg-yellow-50');
            setTimeout(() => {
              refElement.classList.remove('bg-yellow-50');
            }, 2000);
          }
        }
      });
    });
    
    return () => {
      if (!contentRef.current) return;
      const footnoteRefs = contentRef.current.querySelectorAll('.footnote-ref, .wiki-comment');
      footnoteRefs.forEach((ref) => {
        ref.removeEventListener('click', () => {});
      });
      
      const backLinks = contentRef.current.querySelectorAll('a[href^="#footnote-ref-"], a[href^="#comment-ref-"]');
      backLinks.forEach((link) => {
        link.removeEventListener('click', () => {});
      });
    };
  }, [document]);
  
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
            {/* 위키 문법 렌더링 - utils에서 가져온 파서 사용 */}
            <div 
              ref={contentRef}
              className="wiki-content"
              dangerouslySetInnerHTML={{ __html: parseWikiText(document.content) }}
            />
          </div>
        </CardContent>
      </Card>
      
      <Separator className="my-6" />
      
      <div className="text-sm text-muted-foreground">
        <p>
          이 문서는 {formatDate(document.createdAt)}에 {document.createdBy.name}님이 처음 작성했으며,
          {formatDate(document.updatedAt)}에 {document.lastModifiedBy.name}님이 마지막으로 수정했습니다.
        </p>
        <p className="mt-1">
          RoboSSAFYens 위키의 모든 문서는 지속적으로 업데이트되며, 누구나 기여할 수 있습니다.
        </p>
      </div>
      
      {/* 최상단으로 스크롤하는 Top 버튼 */}
      {showTopButton && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={scrollToTop}
                size="icon"
                className="fixed bottom-8 right-8 h-10 w-10 rounded-full shadow-md bg-blue-500 hover:bg-blue-600 transition-all duration-300"
                aria-label="맨 위로 스크롤"
              >
                <ChevronUp className="h-5 w-5 text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>맨 위로</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
} 