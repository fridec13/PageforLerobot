"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, History, Filter } from "lucide-react"
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import userService, { UserContribution } from "@/lib/services/userService"
import { useAuth } from "@/lib/auth"

export default function ContributionsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<string>("all")
  const [contributions, setContributions] = useState<UserContribution[]>([])
  const [filteredContributions, setFilteredContributions] = useState<UserContribution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    // 인증되지 않은 경우 또는 로딩 중인 경우에는 기여 내역을 로드하지 않음
    if (authLoading) return
    
    if (!isAuthenticated) {
      router.push("/auth/login?returnUrl=/profile/contributions")
      return
    }
    
    const loadContributions = async () => {
      try {
        setIsLoading(true)
        const response = await userService.getMyContributions(page, 20)
        setContributions(response.items)
        setFilteredContributions(response.items)
        setTotalPages(response.totalPages)
      } catch (error) {
        console.error('기여 내역 로딩 오류:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadContributions()
  }, [isAuthenticated, authLoading, router, page])

  // 탭 변경 시 필터링
  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredContributions(contributions)
    } else {
      const filtered = contributions.filter(item => 
        activeTab === 'wiki' ? item.type === 'WIKI' : 
        activeTab === 'docs' ? item.type === 'DOCUMENT' : 
        item.type === 'FORUM'
      )
      setFilteredContributions(filtered)
    }
  }, [activeTab, contributions])

  // 조건부 반환은 모든 Hook 선언 후에 배치해야 함
  if (authLoading) {
    return <div className="flex justify-center items-center h-64">로그인 정보 확인 중...</div>
  }
  
  // 로그인하지 않은 경우 로딩 상태 표시 (리다이렉트는 useEffect에서 처리)
  if (!isAuthenticated) {
    return <div className="flex justify-center items-center h-64">로그인 페이지로 이동 중...</div>
  }

  const getContributionTypeBadge = (type: string) => {
    switch(type) {
      case 'WIKI':
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">위키</span>
      case 'DOCUMENT':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">기술문서</span>
      case 'FORUM':
        return <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded">포럼</span>
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded">{type}</span>
    }
  }
  
  const getContributionLink = (contribution: UserContribution) => {
    switch(contribution.type) {
      case 'WIKI':
        return `/wiki/${contribution.id}`
      case 'DOCUMENT':
        return `/docs/${contribution.id}`
      case 'FORUM':
        return `/forum/topics/${contribution.id}`
      default:
        return '#'
    }
  }

  const formatContributionType = (type: string) => {
    switch(type) {
      case 'WIKI': return '위키 편집'
      case 'DOCUMENT': return '문서 수정'
      case 'FORUM': return '포럼 답변'
      default: return type
    }
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
        <History className="h-6 w-6 mr-2" />
        내 기여 내역
      </h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* 필터 탭 */}
        <div className="px-6 pt-4 pb-4 border-b">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">
                전체
              </TabsTrigger>
              <TabsTrigger value="wiki">
                위키
              </TabsTrigger>
              <TabsTrigger value="docs">
                기술문서
              </TabsTrigger>
              <TabsTrigger value="forum">
                포럼
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-10">
              <p>기여 내역을 불러오는 중...</p>
            </div>
          ) : filteredContributions.length > 0 ? (
            <div className="space-y-4">
              {filteredContributions.map((contribution) => (
                <div key={contribution.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <Link href={getContributionLink(contribution)} className="font-medium text-blue-600 hover:underline">
                      {contribution.title}
                    </Link>
                    <div className="text-sm text-gray-500">
                      {format(new Date(contribution.createdAt), 'yyyy년 MM월 dd일', { locale: ko })}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getContributionTypeBadge(contribution.type)}
                      <span className="text-sm text-gray-600">
                        {formatContributionType(contribution.type)}
                      </span>
                    </div>
                    <Link href={getContributionLink(contribution)} className="text-sm text-blue-600 hover:underline">
                      상세 보기
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p className="mb-2">아직 기여 내역이 없습니다.</p>
              <p>문서 편집이나 위키 작성, 포럼 활동으로 기여를 시작해보세요!</p>
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