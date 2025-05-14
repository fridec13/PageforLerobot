"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText, ArrowRight, Clock, Tags, Users, Star, PlusCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/lib/auth"
import wikiService from "@/lib/services/wikiService"
import { WikiDocument, Category } from "@/lib/models/wiki"

export default function WikiPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [popularDocuments, setPopularDocuments] = useState<WikiDocument[]>([])
  const [recentDocuments, setRecentDocuments] = useState<WikiDocument[]>([])
  const [newDocuments, setNewDocuments] = useState<WikiDocument[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWikiData = async () => {
      try {
        setIsLoading(true)
        console.log('위키 데이터 요청 시작');
        
        // 인기 문서, 최근 수정 문서, 신규 문서, 카테고리 병렬로 가져오기
        const [popular, recent, newDocs, cats] = await Promise.all([
          wikiService.getPopularDocuments(4),
          wikiService.getRecentDocuments(3),
          wikiService.getNewDocuments(3),
          wikiService.getCategories()
        ]);
        
        console.log('인기 문서 데이터:', popular);
        console.log('최근 문서 데이터:', recent);
        console.log('새로운 문서 데이터:', newDocs);
        console.log('카테고리 데이터:', cats);
        
        // 응답 검증
        if (Array.isArray(popular)) {
          setPopularDocuments(popular);
        } else {
          console.error('인기 문서 응답이 배열이 아닙니다:', popular);
          setPopularDocuments([]);
        }
        
        if (Array.isArray(recent)) {
          setRecentDocuments(recent);
        } else {
          console.error('최근 문서 응답이 배열이 아닙니다:', recent);
          setRecentDocuments([]);
        }
        
        if (Array.isArray(newDocs)) {
          setNewDocuments(newDocs);
        } else {
          console.error('새로운 문서 응답이 배열이 아닙니다:', newDocs);
          setNewDocuments([]);
        }
        
        if (Array.isArray(cats)) {
          setCategories(cats);
        } else {
          console.error('카테고리 응답이 배열이 아닙니다:', cats);
          setCategories([]);
        }
      } catch (error) {
        console.error("위키 데이터 가져오기 실패:", error)
        // 오류 발생해도 빈 배열로 초기화
        setPopularDocuments([]);
        setRecentDocuments([]);
        setNewDocuments([]);
        setCategories([]);
      } finally {
        setIsLoading(false)
      }
    }

    fetchWikiData()
  }, [])

  // 날짜 포맷팅 함수
  const formatTimeAgo = (date: Date | string) => {
    // 문자열이면 Date 객체로 변환
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}일 전`;
    } else if (diffHours > 0) {
      return `${diffHours}시간 전`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}분 전`;
    } else {
      return "방금 전";
    }
  }

  return (
    <div>
      <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">
        Robo<span className="text-blue-500">SSAFY</span>ens 위키는 로봇 관련 지식을 함께 만들어가는 공간입니다. 
        누구나 문서를 자유롭게 편집하고 수정할 수 있으며, 모든 기여는 기록됩니다.
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Star className="h-5 w-5 text-yellow-500" />
                  인기 위키 문서
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  가장 많이 읽히는 문서들입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 md:space-y-2">
                  {popularDocuments.map((doc) => (
                    <li key={doc.id} className="p-2 hover:bg-muted/50 rounded transition-colors text-sm md:text-base">
                      <Link href={`/wiki/${doc.slug}`} className="text-blue-600 hover:text-blue-800 flex items-center">
                        <FileText className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                        <span className="truncate mr-1">{doc.title}</span>
                        {doc.categories && doc.categories[0] && (
                          <Badge className={`ml-1 md:ml-2 text-xs md:text-sm bg-${getBadgeColor(doc.categories[0].slug)}-100 text-${getBadgeColor(doc.categories[0].slug)}-800 hover:bg-${getBadgeColor(doc.categories[0].slug)}-200`}>
                            {doc.categories[0].name}
                          </Badge>
                        )}
                        <ArrowRight className="ml-auto h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <PlusCircle className="h-5 w-5 text-green-500" />
                  새로 생긴 문서
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 md:space-y-2">
                  {newDocuments.map((doc) => (
                    <li key={doc.id} className="flex items-center gap-2 md:gap-3 py-1 md:py-2 text-sm md:text-base">
                      <div className="flex flex-col flex-1 min-w-0">
                        <Link href={`/wiki/${doc.slug}`} className="text-blue-600 hover:text-blue-800 truncate">
                          {doc.title}
                        </Link>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>{formatTimeAgo(doc.createdAt)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-6 md:mb-8">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Clock className="h-5 w-5 text-blue-500" />
                최근 수정된 문서
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {recentDocuments.map((doc) => (
                  <div key={doc.id} className="p-2 md:p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                    <Link href={`/wiki/${doc.slug}`} className="text-blue-600 hover:text-blue-800 font-medium block truncate text-sm md:text-base">
                      {doc.title}
                    </Link>
                    <div className="flex items-center justify-between mt-1 md:mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatTimeAgo(doc.updatedAt)}
                      </span>
                      {doc.lastModifiedBy && (
                        <div className="flex items-center gap-1">
                          <span>{doc.lastModifiedBy.name?.substring(0, 8) || "알수없음"}</span>
                          <Avatar className="h-4 w-4 md:h-5 md:w-5">
                            <AvatarFallback className={`bg-${getAvatarColor(doc.lastModifiedBy.name)}-100 text-${getAvatarColor(doc.lastModifiedBy.name)}-800 text-xs`}>
                              {getInitials(doc.lastModifiedBy.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Separator className="my-6 md:my-8" />

          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 flex items-center gap-2">
              <Tags className="h-5 w-5 text-blue-500" />
              카테고리
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {categories.map((category) => (
                <Link 
                  key={category.id} 
                  href={`/wiki/category/${category.slug}`} 
                  className={`bg-${getBadgeColor(category.slug)}-100 text-${getBadgeColor(category.slug)}-800 hover:bg-${getBadgeColor(category.slug)}-200 transition-colors p-2 md:p-3 rounded-lg text-center text-sm md:text-base`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Users className="h-5 w-5 text-blue-500" />
                최근 기여자
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 md:gap-3">
                <Avatar className="h-7 w-7 md:h-8 md:w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">JK</AvatarFallback>
                </Avatar>
                <Avatar className="h-7 w-7 md:h-8 md:w-8">
                  <AvatarFallback className="bg-green-100 text-green-800 text-xs">MS</AvatarFallback>
                </Avatar>
                <Avatar className="h-7 w-7 md:h-8 md:w-8">
                  <AvatarFallback className="bg-purple-100 text-purple-800 text-xs">YJ</AvatarFallback>
                </Avatar>
                <Avatar className="h-7 w-7 md:h-8 md:w-8">
                  <AvatarFallback className="bg-orange-100 text-orange-800 text-xs">DH</AvatarFallback>
                </Avatar>
                <Avatar className="h-7 w-7 md:h-8 md:w-8">
                  <AvatarFallback className="bg-red-100 text-red-800 text-xs">SJ</AvatarFallback>
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
function getAvatarColor(name: string | undefined): string {
  if (!name) return 'gray'; // name이 없을 경우 기본 색상 사용
  
  const colors = ['blue', 'green', 'purple', 'orange', 'red'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

// 사용자 이름에서 이니셜 추출
function getInitials(name: string | undefined): string {
  if (!name) return "??";
  const names = name.split(" ");
  return names.length > 1
    ? `${names[0][0]}${names[1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase();
} 