"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { FileText, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import wikiService from "@/lib/services/wikiService"
import { SearchResult } from "@/lib/models/wiki"

// SearchParams를 사용하는 컴포넌트를 분리
function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setResults([])
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        setError(null)
        
        const searchResults = await wikiService.search(query)
        setResults(searchResults)
      } catch (error: any) {
        console.error(`위키 검색 실패 (${query}):`, error)
        setError(error.message || "검색 결과를 불러올 수 없습니다.")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSearchResults()
  }, [query])
  
  // 카테고리 슬러그에 따른 배지 색상 지정
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
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">검색 결과: {query}</h2>
        <p className="text-muted-foreground">
          {isLoading 
            ? "검색 중..." 
            : results.length > 0 
              ? `총 ${results.length}개의 결과를 찾았습니다.` 
              : "검색 결과가 없습니다."}
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="my-8">
          <AlertTitle>검색 오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result) => (
            <Card key={result.id} className="hover:border-blue-200 transition-colors">
              <CardHeader className="pb-2">
                <Link 
                  href={`/wiki/${result.slug}`}
                  className="text-xl font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {result.title}
                </Link>
                <div className="flex flex-wrap gap-2 mt-1">
                  {result.categories.map((category) => (
                    <Badge 
                      key={category.id} 
                      variant="outline"
                      className={`bg-${getBadgeColor(category.slug)}-50 border-${getBadgeColor(category.slug)}-200 text-${getBadgeColor(category.slug)}-800`}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">{result.excerpt}</p>
                <div className="flex justify-between items-center text-sm">
                  <Link 
                    href={`/wiki/${result.slug}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <span>문서 보기</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                  <span className="text-muted-foreground">
                    최근 수정: {formatDate(result.updatedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">검색 결과가 없습니다</h3>
          <p className="text-muted-foreground mb-4">
            "{query}"에 대한 검색 결과가 없습니다. 다른 검색어로 시도해보세요.
          </p>
          <div className="flex justify-center">
            <Link 
              href="/wiki/create"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <span>이 주제로 새 문서 작성하기</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">검색어를 입력하세요</h3>
          <p className="text-muted-foreground">
            위키 문서를 검색하려면 검색어를 입력하세요.
          </p>
        </div>
      )}
    </div>
  )
}

// 메인 컴포넌트에서 Suspense로 감싸기
export default function WikiSearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  )
} 