"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import wikiService from "@/lib/services/wikiService"
import { Category, User as WikiUser, CreateWikiDTO } from "@/lib/models/wiki"

export default function CreateWikiPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoSlug, setAutoSlug] = useState(true)
  
  useEffect(() => {
    // 인증되지 않은 사용자는 로그인 페이지로 리디렉션
    if (!isAuthenticated) {
      router.push("/auth/login?returnUrl=/wiki/create")
      return
    }

    // 카테고리 목록 가져오기
    const fetchCategories = async () => {
      try {
        const categoriesData = await wikiService.getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error("카테고리 가져오기 실패:", error)
        setError("카테고리 정보를 로드하는데 실패했습니다.")
      }
    }

    fetchCategories()
  }, [isAuthenticated, router])
  
  // 제목이 변경되면 자동으로 슬러그 생성
  useEffect(() => {
    if (autoSlug && title) {
      const newSlug = encodeURIComponent(title)
        .replace(/%20/g, "-")  // 공백을 하이픈으로 변환
        .replace(/-+/g, "-")   // 연속된 하이픈을 하나로 합침
      
      setSlug(newSlug)
    }
  }, [title, autoSlug])
  
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // 유효성 검사
    if (!title.trim()) {
      setError("제목을 입력해주세요.")
      return
    }
    
    if (!slug.trim()) {
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
    
    try {
      setIsLoading(true)
      
      // 문서 생성 요청
      await wikiService.createDocument({
        title,
        slug,
        content,
        categories: selectedCategories, // 카테고리 ID 배열
        userId: user?.id, // 백엔드에서 필요한 사용자 ID
        createdBy: user // UI 로직을 위한 사용자 객체
      } as CreateWikiDTO)
      
      // 성공 시 해당 문서 페이지로 이동
      router.push(`/wiki/${slug}`)
    } catch (error: any) {
      console.error("문서 생성 실패:", error)
      setError(error.message || "문서 생성에 실패했습니다.")
      setIsLoading(false)
    }
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>새 위키 문서 작성</CardTitle>
          <CardDescription>
            로봇 관련 지식을 공유하고 커뮤니티에 기여해보세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="slug">URL 식별자</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="auto-slug"
                    checked={autoSlug}
                    onCheckedChange={(checked) => setAutoSlug(checked as boolean)}
                  />
                  <label
                    htmlFor="auto-slug"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    자동 생성
                  </label>
                </div>
              </div>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-friendly-identifier"
                disabled={autoSlug}
                required
              />
              <p className="text-xs text-muted-foreground">
                문서에 접근할 URL의 일부로 사용됩니다. 예: /wiki/<span className="font-mono">{slug || 'example-slug'}</span>
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="마크다운 형식으로 문서 내용을 작성하세요..."
                className="min-h-[300px] font-mono"
                required
              />
              <p className="text-xs text-muted-foreground">
                마크다운 문법을 지원합니다. 제목, 링크, 이미지, 코드 블록 등을 사용할 수 있습니다.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>카테고리 (최소 1개 선택)</Label>
              <div className="grid grid-cols-2 gap-2">
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
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                문서 저장
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 