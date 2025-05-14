"use client"

import { useState } from "react"
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

// 사이트 제작자 데이터
const creators = [
  {
    name: "김성훈",
    role: "프론트엔드 개발, DB 연동, wiki, docs, forum, robocon 페이지 개발, 배포, 로봇 모델 학습, 하드웨어 담당",
    image: "https://api.dicebear.com/7.x/lorelei/svg?seed=dev1",
    github: "https://github.com/username1"
  },
  {
    name: "이름2",
    role: "백엔드 개발",
    image: "https://api.dicebear.com/7.x/lorelei/svg?seed=dev2",
    github: "https://github.com/username2"
  },
  {
    name: "이름3",
    role: "UI/UX 디자인",
    image: "https://api.dicebear.com/7.x/lorelei/svg?seed=dev3",
    github: "https://github.com/username3"
  },
  {
    name: "이름4",
    role: "백엔드 개발",
    image: "https://api.dicebear.com/7.x/lorelei/svg?seed=dev4",
    github: "https://github.com/username4"
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
  const [guestbook, setGuestbook] = useState(initialGuestbook);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 방명록 작성 처리
  const handleSubmitMessage = () => {
    if (!newMessage.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    // 새 메시지 추가
    const newEntry = {
      id: Date.now().toString(),
      name: user?.name || "익명",
      content: newMessage,
      date: new Date()
    };
    
    setGuestbook([newEntry, ...guestbook]);
    setNewMessage("");
    setIsSubmitting(false);
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
                    <Link 
                      href={creator.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline flex items-center"
                    >
                      GitHub 프로필
                    </Link>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {contributors.map((contributor, index) => (
                  <div key={index} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="relative">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={contributor.image} alt={contributor.name} />
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
                  disabled={!isAuthenticated}
                />
                <div className="flex justify-end">
                  {isAuthenticated ? (
                    <Button 
                      onClick={handleSubmitMessage} 
                      disabled={!newMessage.trim() || isSubmitting}
                    >
                      작성하기
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
              <div className="space-y-4">
                {guestbook.map((entry) => (
                  <div key={entry.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{entry.name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.date), 'yyyy년 MM월 dd일', { locale: ko })}
                      </span>
                    </div>
                    <p className="text-sm">{entry.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 