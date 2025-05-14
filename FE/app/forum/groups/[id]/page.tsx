"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, MessageSquare, Edit, Users, Settings, Menu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // 실제로는 API에서 그룹 데이터를 가져오지만, 지금은 더미 데이터 사용
    const fetchGroup = () => {
      setTimeout(() => {
        // 샘플 그룹 데이터
        setGroup({
          id: params.id,
          name: "RoboDK 개발자 모임",
          description: "RoboDK API 개발과 관련된 정보를 공유하고 문제를 함께 해결하는 그룹입니다. 이 그룹에서는 RoboDK 라이브러리 사용 방법, API 활용 사례, 자동화 스크립트 작성 팁 등을 공유합니다.",
          category: "개발",
          isPrivate: false,
          image: "https://api.dicebear.com/7.x/identicon/svg?seed=robodk",
          createdAt: "2023-06-10T09:00:00Z",
          createdBy: "로봇마스터",
          memberCount: 42,
          isMember: true,
          topics: [
            {
              id: "topic_1",
              title: "RoboDK Python API로 로봇 제어하는 방법",
              author: "로봇마스터",
              createdAt: "2023-08-12T14:30:00Z",
              replies: 7,
              views: 53
            },
            {
              id: "topic_2",
              title: "RoboDK API에서 시뮬레이션과 실제 로봇 연동하기",
              author: "테크노진",
              createdAt: "2023-08-05T10:15:00Z",
              replies: 12,
              views: 78
            },
            {
              id: "topic_3",
              title: "RoboDK 라이선스 관련 질문이 있습니다",
              author: "로봇애호가",
              createdAt: "2023-07-28T16:22:00Z",
              replies: 4,
              views: 32
            }
          ],
          members: [
            {
              id: "user_1",
              name: "로봇마스터",
              image: "https://api.dicebear.com/7.x/lorelei/svg?seed=user1",
              role: "관리자",
              joinedAt: "2023-06-10T09:00:00Z"
            },
            {
              id: "user_2",
              name: "테크노진",
              image: "https://api.dicebear.com/7.x/lorelei/svg?seed=user2",
              role: "일반회원",
              joinedAt: "2023-06-12T13:45:00Z"
            },
            {
              id: "user_3",
              name: "로봇애호가",
              image: "https://api.dicebear.com/7.x/lorelei/svg?seed=user3",
              role: "일반회원",
              joinedAt: "2023-06-15T11:20:00Z"
            },
            {
              id: "user_4",
              name: "코딩천재",
              image: "https://api.dicebear.com/7.x/lorelei/svg?seed=user4",
              role: "일반회원",
              joinedAt: "2023-06-18T15:30:00Z"
            },
            {
              id: "user_5",
              name: "인공지능연구원",
              image: "https://api.dicebear.com/7.x/lorelei/svg?seed=user5",
              role: "일반회원",
              joinedAt: "2023-06-20T09:15:00Z"
            }
          ]
        });
        
        // 샘플에서는 첫 번째 회원을 관리자로 가정
        setIsAdmin(true);
        setIsLoading(false);
      }, 500);
    };
    
    fetchGroup();
  }, [params.id]);

  // 그룹 탈퇴
  const handleLeaveGroup = () => {
    if (window.confirm("정말로 이 그룹을 탈퇴하시겠습니까?")) {
      // 실제로는 API를 호출하여 그룹 탈퇴 처리
      console.log("그룹 탈퇴:", params.id);
      alert("그룹에서 탈퇴하였습니다.");
      router.push("/forum/groups");
    }
  };

  // 그룹 가입
  const handleJoinGroup = () => {
    // 실제로는 API를 호출하여 그룹 가입 처리
    console.log("그룹 가입:", params.id);
    alert("그룹에 가입하였습니다.");
    setGroup({ ...group, isMember: true });
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center">
        <p>그룹 정보를 불러오는 중...</p>
      </div>
    );
  }
  
  if (!group) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">그룹을 찾을 수 없습니다.</h1>
        <Button asChild>
          <Link href="/forum/groups">그룹 목록으로 돌아가기</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 뒤로 가기 */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/forum/groups">
            <ChevronLeft className="h-4 w-4 mr-1" />
            모든 그룹으로 돌아가기
          </Link>
        </Button>
      </div>
      
      {/* 그룹 헤더 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-start">
            <Avatar className="h-16 w-16 mr-4">
              <AvatarImage src={group.image} alt={group.name} />
              <AvatarFallback>{group.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold mb-1">{group.name}</h1>
                  <div className="flex gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-800">{group.category}</Badge>
                    <Badge className={group.isPrivate ? "bg-gray-100 text-gray-800" : "bg-green-100 text-green-800"}>
                      {group.isPrivate ? "비공개" : "공개"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {group.memberCount}명의 회원 | 생성일: {formatDate(group.createdAt)} | 그룹장: {group.createdBy}
                  </p>
                </div>
                
                {/* 그룹 액션 버튼 */}
                <div className="flex space-x-2">
                  {group.isMember ? (
                    <>
                      <Button>
                        <MessageSquare className="h-4 w-4 mr-1" /> 새 토픽 작성
                      </Button>
                      {isAdmin && (
                        <Button variant="outline" asChild>
                          <Link href={`/forum/groups/${params.id}/edit`}>
                            <Settings className="h-4 w-4 mr-1" /> 그룹 관리
                          </Link>
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Menu className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link href={`/forum/groups/${params.id}/members`} className="flex w-full">
                              멤버 전체 보기
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>그룹 공유</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={handleLeaveGroup}>
                            그룹 탈퇴
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  ) : (
                    <Button onClick={handleJoinGroup}>
                      그룹 가입하기
                    </Button>
                  )}
                </div>
              </div>
              
              <p className="text-gray-700 mt-4">{group.description}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 그룹 콘텐츠 (토픽 및 멤버) */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Tabs defaultValue="topics" className="w-full">
          <div className="px-6 pt-4 pb-4 border-b">
            <TabsList>
              <TabsTrigger value="topics">토픽</TabsTrigger>
              <TabsTrigger value="members">멤버</TabsTrigger>
              <TabsTrigger value="about">정보</TabsTrigger>
            </TabsList>
          </div>
          
          {/* 토픽 탭 */}
          <TabsContent value="topics" className="p-0">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">그룹 토픽</h2>
                {group.isMember && (
                  <Button>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    새 토픽 작성
                  </Button>
                )}
              </div>
              
              {group.topics && group.topics.length > 0 ? (
                <div className="divide-y">
                  {group.topics.map((topic: any) => (
                    <div key={topic.id} className="py-4">
                      <div className="flex justify-between mb-1">
                        <Link href={`/forum/topics/${topic.id}`} className="text-blue-600 font-medium hover:underline">
                          {topic.title}
                        </Link>
                        <span className="text-sm text-gray-500">{formatDate(topic.createdAt)}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span>작성자: {topic.author}</span>
                        <span className="mx-2">•</span>
                        <span>답변: {topic.replies}</span>
                        <span className="mx-2">•</span>
                        <span>조회: {topic.views}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>아직 작성된 토픽이 없습니다.</p>
                  {group.isMember && (
                    <Button className="mt-4">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      첫 토픽 작성하기
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* 멤버 탭 */}
          <TabsContent value="members" className="p-0">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">그룹 멤버 ({group.memberCount})</h2>
                {isAdmin && (
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    멤버 관리
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.members.slice(0, 6).map((member: any) => (
                  <div key={member.id} className="flex items-center p-3 border rounded-lg">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={member.image} alt={member.name} />
                      <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center">
                        <Link href={`/forum/users/${member.id}`} className="font-medium hover:underline">
                          {member.name}
                        </Link>
                        {member.role === "관리자" && (
                          <Badge className="ml-2 bg-blue-100 text-blue-800">관리자</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">가입일: {formatDate(member.joinedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {group.memberCount > 6 && (
                <div className="text-center mt-4">
                  <Button variant="outline" asChild>
                    <Link href={`/forum/groups/${params.id}/members`}>
                      모든 멤버 보기
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* 정보 탭 */}
          <TabsContent value="about" className="p-6">
            <h2 className="text-xl font-semibold mb-4">그룹 정보</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">그룹 설명</h3>
                <p className="mt-1">{group.description}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">카테고리</h3>
                <p className="mt-1">{group.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">그룹 유형</h3>
                <p className="mt-1">{group.isPrivate ? "비공개 그룹" : "공개 그룹"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">개설일</h3>
                <p className="mt-1">{formatDate(group.createdAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">그룹장</h3>
                <p className="mt-1">{group.createdBy}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 