"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, Star, Award, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useAuth } from "@/lib/auth"
import guestbookService, { GuestbookEntry } from '@/lib/services/guestbookService'
import leaderboardService, { Contributor } from '@/lib/services/leaderboardService'

// 사이트 제작자 데이터
const creators = [
  {
    name: "김성훈",
    role: "프론트엔드 개발, DB 연동, wiki, docs, forum, robocon 페이지 개발, 배포, 로봇 모델 학습, 하드웨어 담당",
    image: "https://api.dicebear.com/7.x/lorelei/svg?seed=dev1",
    github: "https://github.com/fridec13"
  },
  {
    name: "권우현",
    role: "하드웨어 담당, 로봇 학습 디렉팅, 르로봇 코드 분석, 태스크 구현",
    image: "https://api.dicebear.com/7.x/lorelei/svg?seed=dev2",
    huggingface: "https://huggingface.co/woohyunwoo"
  },
  {
    name: "손재민",
    role: "하드웨어 조립, 젠킨스 테스트, 영상포트폴리오 제작작, JWT 테스트 개발발",
    image: "https://api.dicebear.com/7.x/lorelei/svg?seed=dev3",
  },
  {
    name: "윤상묵",
    role: "백엔드 커뮤니티 테스트트 개발",
    image: "https://api.dicebear.com/7.x/lorelei/svg?seed=dev4",
  },
  {
    name: "허재웅",
    role: "지식 공유 및 GPU 서버 관리",
    image: "https://api.dicebear.com/7.x/lorelei/svg?seed=dev5",
  },
  {
    name: "박수연",
    role: "하드웨어 환경 조성",
    image: "https://api.dicebear.com/7.x/lorelei/svg?seed=dev6",
  }
];

// 기여자 명예의 전당 데이터
const contributors = [
  {
    name: "기여자1",
    contributions: 156,
    level: "Sapiens",
    image: "https://api.dicebear.com/7.x/lorelei/svg?seed=contrib1"
  },
  {
    name: "기여자2",
    contributions: 98,
    level: "Expert",
    image: "https://api.dicebear.com/7.x/lorelei/svg?seed=contrib2"
  },
  {
    name: "기여자3",
    contributions: 75,
    level: "Researcher",
    image: "https://api.dicebear.com/7.x/lorelei/svg?seed=contrib3"
  },
  {
    name: "기여자4",
    contributions: 62,
    level: "Master",
    image: "https://api.dicebear.com/7.x/lorelei/svg?seed=contrib4"
  },
  {
    name: "기여자5",
    contributions: 47,
    level: "Advanced",
    image: "https://api.dicebear.com/7.x/lorelei/svg?seed=contrib5"
  },
  {
    name: "기여자6",
    contributions: 32,
    level: "Regular",
    image: "https://api.dicebear.com/7.x/lorelei/svg?seed=contrib6"
  }
];

// 방명록 더미 데이터
const initialGuestbook = [
  {
    id: "1",
    name: "방문자1",
    content: "멋진 사이트네요! 로봇 관련 지식을 얻을 수 있어 좋습니다.",
    date: new Date(2023, 4, 15)
  },
  {
    id: "2",
    name: "방문자2",
    content: "RoboDK 문서가 큰 도움이 되었습니다. 감사합니다!",
    date: new Date(2023, 4, 20)
  },
  {
    id: "3",
    name: "방문자3",
    content: "위키 정보가 정말 유용해요. 앞으로도 자주 방문할게요.",
    date: new Date(2023, 5, 5)
  }
];

export default function CreditsPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("creators");
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState({
    guestbook: false,
    contributors: false
  });
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 초기 데이터 로딩
  useEffect(() => {
    // 방명록 데이터 로딩
    const loadGuestbook = async () => {
      setLoading(prev => ({ ...prev, guestbook: true }));
      try {
        // 백엔드 연결이 준비되면 실제 API 호출로 변경
        // const response = await guestbookService.getEntries();
        // setGuestbook(response.entries);
        
        // 임시 데이터 사용
        const mockEntries = guestbookService.getMockEntries();
        setGuestbook(mockEntries);
      } catch (error) {
        console.error('방명록 로딩 오류:', error);
      } finally {
        setLoading(prev => ({ ...prev, guestbook: false }));
      }
    };
    
    // 리더보드 데이터 로딩
    const loadContributors = async () => {
      setLoading(prev => ({ ...prev, contributors: true }));
      try {
        // 백엔드 연결이 준비되면 실제 API 호출로 변경
        // const response = await leaderboardService.getContributors();
        // setContributors(response.contributors);
        
        // 임시 데이터 사용
        const mockContributors = leaderboardService.getMockContributors();
        setContributors(mockContributors);
      } catch (error) {
        console.error('기여자 로딩 오류:', error);
      } finally {
        setLoading(prev => ({ ...prev, contributors: false }));
      }
    };
    
    // 탭에 따라 필요한 데이터만 로딩
    if (activeTab === 'guestbook') {
      loadGuestbook();
    } else if (activeTab === 'contributors') {
      loadContributors();
    }
  }, [activeTab]);

  // 방명록 작성 처리
  const handleSubmitMessage = async () => {
    if (!newMessage.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // 백엔드 연결이 준비되면 실제 API 호출로 변경
      // const newEntry = await guestbookService.createEntry({ content: newMessage });
      
      // 임시 데이터 생성
      const newEntry: GuestbookEntry = {
        id: Date.now().toString(),
        name: user?.name || "익명",
        content: newMessage,
        date: new Date()
      };
      
      setGuestbook([newEntry, ...guestbook]);
      setNewMessage("");
    } catch (error) {
      console.error('방명록 작성 오류:', error);
      alert('방명록 작성 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 뒤로 가기 */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ChevronLeft className="h-4 w-4 mr-1" />
            홈으로 돌아가기
          </Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-2">크레딧</h1>
      <p className="text-muted-foreground mb-8">RoboSSAFYens를 만들어가는 사람들과 기여자들입니다.</p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-10">
        <TabsList className="mb-6">
          <TabsTrigger value="creators">
            <Star className="h-4 w-4 mr-2" />
            제작자
          </TabsTrigger>
          <TabsTrigger value="contributors">
            <Award className="h-4 w-4 mr-2" />
            명예의 전당
          </TabsTrigger>
          <TabsTrigger value="guestbook">
            <MessageSquare className="h-4 w-4 mr-2" />
            방명록
          </TabsTrigger>
        </TabsList>

        {/* 제작자 탭 */}
        <TabsContent value="creators">
          <Card>
            <CardHeader>
              <CardTitle>HomoSSAFYens 팀</CardTitle>
              <CardDescription>RoboSSAFYens 개발 및 유지 관리를 담당하는 핵심 팀입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {creators.map((creator, index) => (
                  <div key={index} className="flex flex-col items-center text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={creator.image} alt={creator.name} />
                      <AvatarFallback>{creator.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg">{creator.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{creator.role}</p>
                    {creator.github && (
                      <Link 
                        href={creator.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline flex items-center"
                      >
                        GitHub 프로필
                      </Link>
                    )}
                    {creator.huggingface && (
                      <Link 
                        href={creator.huggingface} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline flex items-center"
                      >
                        HuggingFace 프로필
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 명예의 전당 탭 */}
        <TabsContent value="contributors">
          <Card>
            <CardHeader>
              <CardTitle>명예의 전당</CardTitle>
              <CardDescription>RoboSSAFYens에 많은 기여를 한 사용자들입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.contributors ? (
                <div className="flex justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">기여자 정보를 불러오는 중...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contributors.map((contributor, index) => (
                    <div key={contributor.id} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="relative">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={contributor.avatar} alt={contributor.name} />
                          <AvatarFallback>{contributor.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
                          <span className="text-xs font-bold">{index + 1}</span>
                        </div>
                      </div>
                      <div className="ml-4 flex-grow">
                        <div className="flex items-center">
                          <h3 className="font-bold">{contributor.name}</h3>
                          <Badge className="ml-2 bg-blue-100 text-blue-800">{contributor.level}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-blue-600">{contributor.contributions}</span> 기여
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 방명록 탭 */}
        <TabsContent value="guestbook">
          <Card>
            <CardHeader>
              <CardTitle>방명록</CardTitle>
              <CardDescription>RoboSSAFYens에 방문한 기록과 소감을 남겨주세요.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* 방명록 작성 폼 */}
              <div className="mb-6">
                <Textarea
                  placeholder="방명록 메시지를 남겨주세요..."
                  className="mb-2 min-h-[100px]"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={!isAuthenticated || isSubmitting}
                />
                <div className="flex justify-end">
                  {isAuthenticated ? (
                    <Button 
                      onClick={handleSubmitMessage} 
                      disabled={!newMessage.trim() || isSubmitting}
                    >
                      {isSubmitting ? '작성 중...' : '작성하기'}
                    </Button>
                  ) : (
                    <Button variant="outline" asChild>
                      <Link href="/auth/login?returnUrl=/credits">로그인하고 작성하기</Link>
                    </Button>
                  )}
                </div>
              </div>
              
              <Separator className="my-6" />
              
              {/* 방명록 목록 */}
              {loading.guestbook ? (
                <div className="flex justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">방명록을 불러오는 중...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {guestbook.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">아직 방명록이 없습니다. 첫 번째 방명록을 작성해보세요!</p>
                  ) : (
                    guestbook.map((entry) => (
                      <div key={entry.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">{entry.name}</h3>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(entry.date), 'yyyy년 MM월 dd일', { locale: ko })}
                          </span>
                        </div>
                        <p className="text-sm">{entry.content}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 