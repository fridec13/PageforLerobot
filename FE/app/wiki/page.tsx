"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText, ArrowRight, Clock, Tags, Users, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/lib/store/authStore"
import wikiService from "@/lib/services/wikiService"
import { WikiDocument, Category } from "@/lib/models/wiki"

export default function WikiPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [popularDocuments, setPopularDocuments] = useState<WikiDocument[]>([])
  const [recentDocuments, setRecentDocuments] = useState<WikiDocument[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWikiData = async () => {
      try {
        setIsLoading(true)
        // 인기 문서, 최근 수정 문서, 카테고리 병렬로 가져오기
        const [popular, recent, cats] = await Promise.all([
          wikiService.getPopularDocuments(4),
          wikiService.getRecentDocuments(3),
          wikiService.getCategories()
        ])
        
        setPopularDocuments(popular)
        setRecentDocuments(recent)
        setCategories(cats)
      } catch (error) {
        console.error("위키 데이터 가져오기 실패:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWikiData()
  }, [])

  // 날짜 포맷팅 함수
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays}일 전`
    } else if (diffHours > 0) {
      return `${diffHours}시간 전`
    } else if (diffMinutes > 0) {
      return `${diffMinutes}분 전`
    } else {
      return "방금 전"
    }
  }

  return (
    <div>
      <p className="text-muted-foreground mb-8">
        Robo<span className="text-blue-500">SSAFY</span>ens 위키는 로봇 관련 지식을 함께 만들어가는 공간입니다. 
        누구나 문서를 자유롭게 편집하고 수정할 수 있으며, 모든 기여는 기록됩니다.
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  인기 위키 문서
                </CardTitle>
                <CardDescription>
                  가장 많이 읽히는 문서들입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {popularDocuments.map((doc) => (
                    <li key={doc.id} className="p-2 hover:bg-muted/50 rounded transition-colors">
                      <Link href={`/wiki/${doc.slug}`} className="text-blue-600 hover:text-blue-800 flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        {doc.title}
                        {doc.categories[0] && (
                          <Badge className={`ml-2 bg-${getBadgeColor(doc.categories[0].slug)}-100 text-${getBadgeColor(doc.categories[0].slug)}-800 hover:bg-${getBadgeColor(doc.categories[0].slug)}-200`}>
                            {doc.categories[0].name}
                          </Badge>
                        )}
                        <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  최근 수정된 문서
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {recentDocuments.map((doc) => (
                    <li key={doc.id} className="flex items-center gap-3">
                      <div className="flex flex-col flex-1 min-w-0">
                        <Link href={`/wiki/${doc.slug}`} className="text-blue-600 hover:text-blue-800 truncate">
                          {doc.title}
                        </Link>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>{formatTimeAgo(doc.updatedAt)}</span>
                        </div>
                      </div>
                      {doc.lastModifiedBy && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className={`bg-${getAvatarColor(doc.lastModifiedBy.username)}-100 text-${getAvatarColor(doc.lastModifiedBy.username)}-800 text-xs`}>
                            {getInitials(doc.lastModifiedBy.username)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-8" />

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Tags className="h-5 w-5 text-blue-500" />
              카테고리
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link 
                  key={category.id} 
                  href={`/wiki/category/${category.slug}`} 
                  className={`bg-${getBadgeColor(category.slug)}-100 text-${getBadgeColor(category.slug)}-800 hover:bg-${getBadgeColor(category.slug)}-200 transition-colors p-3 rounded-lg text-center`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                최근 기여자
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-800">JK</AvatarFallback>
                </Avatar>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-green-100 text-green-800">MS</AvatarFallback>
                </Avatar>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-purple-100 text-purple-800">YJ</AvatarFallback>
                </Avatar>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-orange-100 text-orange-800">DH</AvatarFallback>
                </Avatar>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-red-100 text-red-800">SJ</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

// 카테고리 슬러그에 따른 배지 색상 지정
function getBadgeColor(slug: string): string {
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

// 아바타 색상 랜덤 지정
function getAvatarColor(username: string): string {
  const colors = ['blue', 'green', 'purple', 'orange', 'red']
  const index = username.charCodeAt(0) % colors.length
  return colors[index]
}

// 사용자 이름에서 이니셜 추출
function getInitials(name: string): string {
  if (!name) return "??"
  const names = name.split(" ")
  return names.length > 1
    ? `${names[0][0]}${names[1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase()
} 