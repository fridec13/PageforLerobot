"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Clock, AlertCircle, GitCompare, RotateCcw } from "lucide-react"
import wikiService from "@/lib/services/wikiService"
import { Revision, WikiDocument } from "@/lib/models/wiki"
import { useAuthStore } from "@/lib/auth"

export default function WikiHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const slug = params.slug as string
  
  const [document, setDocument] = useState<WikiDocument | null>(null)
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRevision, setSelectedRevision] = useState<string | null>(null)
  
  // 문서와 역사 정보 불러오기
  useEffect(() => {
    const fetchDocumentAndHistory = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // 문서와 수정 이력을 병렬로 가져오기
        const [documentData, revisionsData] = await Promise.all([
          wikiService.getDocumentBySlug(slug),
          wikiService.getRevisions(slug)
        ])
        
        setDocument(documentData)
        setRevisions(revisionsData)
        
        // 페이지 제목 설정
        if (typeof window !== 'undefined') {
          window.document.title = `${documentData.title} 역사 - RoboSSAFYens 위키`;
          
          // 헤더 제목 업데이트를 위한 커스텀 이벤트
          window.dispatchEvent(new CustomEvent('updateWikiTitle', {
            detail: { 
              title: `${documentData.title} 역사`,
              categories: []
            }
          }));
        }
      } catch (error: any) {
        console.error(`위키 문서 역사 로드 실패 (${slug}):`, error)
        setError(error.message || "문서 역사를 불러올 수 없습니다.")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDocumentAndHistory()
    
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
  
  // 비교 페이지로 이동
  const handleCompare = () => {
    if (selectedRevision) {
      router.push(`/wiki/${slug}/compare/${selectedRevision}`)
    }
  }
  
  // 특정 버전으로 복원
  const handleRestore = async () => {
    if (!selectedRevision || !isAuthenticated) {
      return
    }
    
    try {
      // 선택된 버전 가져오기
      const selectedVersion = revisions.find(rev => rev.id === selectedRevision)
      if (!selectedVersion) return
      
      // 복원 확인 대화상자
      if (window.confirm(`정말로 "${formatDate(selectedVersion.createdAt)}" 버전으로 복원하시겠습니까?`)) {
        // TODO: 실제 복원 구현
        router.push(`/wiki/${slug}/edit?restore=${selectedRevision}`)
      }
    } catch (error: any) {
      console.error("버전 복원 실패:", error)
      alert("선택한 버전으로 복원하는데 실패했습니다.")
    }
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
        <AlertTitle>문서 역사를 불러올 수 없습니다</AlertTitle>
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
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            문서 수정 이력
          </CardTitle>
          <CardDescription>
            {document.title} 문서의 모든 수정 이력을 확인할 수 있습니다.
            {revisions.length > 0 ? ` 총 ${revisions.length}개의 수정 이력이 있습니다.` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {revisions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              이 문서에는 수정 이력이 없습니다.
            </div>
          ) : (
            <>
              <div className="flex justify-end space-x-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCompare}
                  disabled={!selectedRevision}
                  className="flex items-center"
                >
                  <GitCompare className="mr-2 h-4 w-4" />
                  현재 버전과 비교
                </Button>
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRestore}
                    disabled={!selectedRevision}
                    className="flex items-center"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    이 버전으로 복원
                  </Button>
                )}
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">선택</TableHead>
                      <TableHead>버전</TableHead>
                      <TableHead>수정자</TableHead>
                      <TableHead>수정일</TableHead>
                      <TableHead>수정 이유</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revisions.map((revision) => (
                      <TableRow 
                        key={revision.id}
                        className={selectedRevision === revision.id ? "bg-muted/50" : ""}
                      >
                        <TableCell className="font-medium text-center">
                          <input
                            type="radio"
                            name="revision"
                            value={revision.id}
                            checked={selectedRevision === revision.id}
                            onChange={() => setSelectedRevision(revision.id)}
                            className="rounded-full"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {revision.id === revisions[0].id ? (
                            <Badge className="bg-blue-500">최신</Badge>
                          ) : (
                            <Badge variant="outline">버전 {revisions.findIndex(r => r.id === revision.id) + 1}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-xs">
                                {getInitials(revision.createdBy.username)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{revision.createdBy.username}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(revision.createdAt)}</TableCell>
                        <TableCell>{revision.comment}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {selectedRevision && (
        <Card>
          <CardHeader>
            <CardTitle>선택한 버전 미리보기</CardTitle>
            <CardDescription>
              {revisions.find(rev => rev.id === selectedRevision)?.createdAt && 
                formatDate(revisions.find(rev => rev.id === selectedRevision)!.createdAt)
              }에 저장된 버전입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-blue max-w-none dark:prose-invert border p-4 rounded-md bg-muted/30">
              <div className="whitespace-pre-wrap">
                {revisions.find(rev => rev.id === selectedRevision)?.content || "내용을 불러올 수 없습니다."}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 