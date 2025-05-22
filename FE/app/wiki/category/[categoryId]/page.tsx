"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Tag, Clock, ArrowLeft, Search, Info } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import wikiService from "@/lib/services/wikiService"
import { WikiDocument, Category } from "@/lib/models/wiki"

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.categoryId as string
  
  const [documents, setDocuments] = useState<WikiDocument[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // 모든 카테고리 가져오기
        const allCategories = await wikiService.getCategories()
        setCategories(allCategories)
        
        // 현재 카테고리 찾기
        const currentCategory = allCategories.find(cat => cat.slug === categoryId)
        
        if (!currentCategory) {
          setError(`"${categoryId}" 카테고리를 찾을 수 없습니다.`)
          setIsLoading(false)
          return
        }
        
        setCategory(currentCategory)
        
        // 현재 카테고리에 속한 문서 가져오기
        const response = await wikiService.getDocuments({ category: currentCategory.id })
        setDocuments(response.documents)

        // 페이지 제목 설정
        if (typeof window !== 'undefined') {
          window.document.title = `${currentCategory.name} - RoboSSAFYens 위키 카테고리`;
        }
        
      } catch (error: any) {
        console.error(`카테고리 페이지 로드 실패 (${categoryId}):`, error)
        setError(error.message || "카테고리 정보를 불러올 수 없습니다.")
      } finally {
        setIsLoading(false)
      }
    }
    
    if (categoryId) {
      fetchData()
    }
    
    // 컴포넌트 언마운트 시 제목 초기화
    return () => {
      if (typeof window !== 'undefined') {
        window.document.title = 'RoboSSAFYens 위키';
      }
    }
  }, [categoryId])
  
  // 배경색 결정 함수
  const getBadgeColor = (slug: string): string => {
    const colorMap: Record<string, string> = {
      'basics': 'blue',
      'hardware': 'green',
      'software': 'purple',
      'ai': 'orange',
      'sensors': 'red',
      'applications': 'yellow',
      'programming': 'indigo',
      'future': 'cyan',
      'technology': 'green',
      'control': 'red',
      'autonomous': 'teal',
      'ros': 'violet'
    }
    
    return colorMap[slug] || 'blue'
  }
  
  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (error || !category) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertTitle>카테고리를 찾을 수 없습니다</AlertTitle>
        <AlertDescription>
          <p>{error || "요청하신 카테고리가 존재하지 않습니다."}</p>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => router.push("/wiki")}
              className="mr-2"
            >
              위키 홈으로
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/wiki")}
          className="mb-4 flex items-center text-muted-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          위키 홈으로
        </Button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Tag className={`mr-2 h-6 w-6 text-${getBadgeColor(category.slug)}-500`} />
              {category.name}
            </h1>
            {category.description && (
              <p className="text-muted-foreground mt-1">{category.description}</p>
            )}
          </div>
          
          <Badge className={`bg-${getBadgeColor(category.slug)}-100 text-${getBadgeColor(category.slug)}-800 hover:bg-${getBadgeColor(category.slug)}-200 px-3 py-1`}>
            문서 {documents.length}개
          </Badge>
        </div>
        
        <Separator className="my-4" />
      </div>
      
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">문서가 없습니다</h3>
          <p className="text-muted-foreground mb-6">
            이 카테고리에는 아직 문서가 없습니다. 첫 번째 문서를 작성해 보세요!
          </p>
          <Button onClick={() => router.push("/wiki/create")}>
            새 문서 작성하기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <Link href={`/wiki/${doc.slug}`} className="block p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold text-blue-600 hover:underline flex items-center">
                        <FileText className="h-5 w-5 mr-2 flex-shrink-0" />
                        {doc.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {formatDate(doc.updatedAt)}
                        </span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>조회수: {doc.viewCount}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {doc.categories && doc.categories
                        .filter(cat => cat && category && cat.id !== category.id)
                        .slice(0, 3)
                        .map(cat => (
                          <Badge 
                            key={cat.id || 'unknown'}
                            variant="outline"
                            className="bg-transparent"
                          >
                            {cat.name || '알 수 없음'}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">다른 카테고리 둘러보기</h3>
        <div className="flex flex-wrap gap-2">
          {categories
            .filter(cat => cat.id !== category.id)
            .map(cat => (
              <Link 
                key={cat.id} 
                href={`/wiki/category/${cat.slug}`}
                className={`bg-${getBadgeColor(cat.slug)}-100 text-${getBadgeColor(cat.slug)}-800 px-3 py-1 rounded-md hover:bg-${getBadgeColor(cat.slug)}-200 transition-colors`}
              >
                {cat.name}
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
} 