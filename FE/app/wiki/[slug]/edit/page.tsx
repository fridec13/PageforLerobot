"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ChevronLeft, Save, Eye, ArrowLeft, Loader2 } from "lucide-react"
import { useAuthStore } from "@/lib/store/authStore"
import wikiService from "@/lib/services/wikiService"
import { WikiDocument, Category } from "@/lib/models/wiki"

export default function EditWikiPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const slug = params.slug as string
  
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [editComment, setEditComment] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [originalDocument, setOriginalDocument] = useState<WikiDocument | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  
  // 인증 확인 및 문서 로드
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/auth/login?returnUrl=/wiki/${slug}/edit`)
      return
    }
    
    const fetchDocumentAndCategories = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // 문서와 카테고리 정보 가져오기
        const [documentData, categoriesData] = await Promise.all([
          wikiService.getDocumentBySlug(slug),
          wikiService.getCategories()
        ])
        
        // 문서 정보 설정
        setOriginalDocument(documentData)
        setTitle(documentData.title)
        setContent(documentData.content)
        setNewSlug(documentData.slug)
        setSelectedCategories(documentData.categories.map(c => c.id))
        
        // 카테고리 목록 설정
        setCategories(categoriesData)
        
        // 페이지 제목 설정
        if (typeof window !== 'undefined') {
          window.document.title = `${documentData.title} 편집 - RoboSSAFYens 위키`;
          
          // 헤더 제목 업데이트를 위한 커스텀 이벤트
          window.dispatchEvent(new CustomEvent('updateWikiTitle', {
            detail: { 
              title: `${documentData.title} 편집`,
              categories: []
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
    
    fetchDocumentAndCategories()
    
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
  }, [slug, isAuthenticated, router])
  
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }
  
  const handleSave = async () => {
    // 유효성 검사
    if (!title.trim()) {
      setError("제목을 입력해주세요.")
      return
    }
    
    if (!newSlug.trim()) {
      setError("URL 식별자를 입력해주세요.")
      return
    }
    
    if (!content.trim()) {
      setError("내용을 입력해주세요.")
      return
    }
    
    if (selectedCategories.length === 0) {
      setError("최소 하나 이상의 카테고리를 선택해주세요.")
      return
    }
    
    if (!editComment.trim()) {
      setError("수정 이유를 입력해주세요.")
      return
    }
    
    try {
      setIsSaving(true)
      setError(null)
      
      // 선택된 카테고리 객체 목록 생성
      const categoryObjects = selectedCategories.map(id => 
        categories.find(cat => cat.id === id)
      ).filter(Boolean) as Category[]
      
      // 문서 업데이트 요청
      const updatedDocument = await wikiService.updateDocument(slug, {
        title,
        slug: newSlug, // 슬러그가 변경된 경우
        content,
        categories: categoryObjects,
        lastModifiedBy: user || undefined
      }, editComment)
      
      // 성공 시 해당 문서 페이지로 이동
      router.push(`/wiki/${newSlug}`)
    } catch (error: any) {
      console.error("문서 수정 실패:", error)
      setError(error.message || "문서 수정에 실패했습니다.")
      setIsSaving(false)
    }
  }
  
  const handleCancel = () => {
    router.back()
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (error && !originalDocument) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>문서를 불러올 수 없습니다</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="flex items-center text-muted-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          문서로 돌아가기
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "edit" | "preview")} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center">
            <Save className="mr-2 h-4 w-4" />
            편집
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center">
            <Eye className="mr-2 h-4 w-4" />
            미리보기
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>위키 문서 편집</CardTitle>
              <CardDescription>
                내용을 수정하고 저장 버튼을 클릭하세요. 모든 수정 사항은 기록됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="문서 제목을 입력하세요"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">URL 식별자</Label>
                <Input
                  id="slug"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="url-friendly-identifier"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  문서에 접근할 URL의 일부로 사용됩니다. 예: /wiki/<span className="font-mono">{newSlug || slug}</span>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="마크다운 형식으로 문서 내용을 작성하세요..."
                  className="min-h-[400px] font-mono resize-y"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  마크다운 문법을 지원합니다. 제목, 링크, 이미지, 코드 블록 등을 사용할 수 있습니다.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>카테고리 (최소 1개 선택)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border rounded-md p-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="edit-comment">수정 이유</Label>
                <Input
                  id="edit-comment"
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  placeholder="예: 오타 수정, 내용 추가..."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  수정 이력에 표시될 간단한 수정 이유를 입력하세요.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                취소
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    문서 저장
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{title || originalDocument?.title}</CardTitle>
              <CardDescription>
                편집 내용 미리보기
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-blue max-w-none dark:prose-invert">
                {/* 실제로는 마크다운 렌더링 라이브러리 사용 */}
                <div className="whitespace-pre-wrap">{content}</div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("edit")}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                편집으로 돌아가기
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    문서 저장
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 