"use client"

import Link from "next/link"
import { MessageSquare, Users, Award, UsersRound } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import forumService, { ForumPost } from "@/lib/services/forumService"

export default function ForumPage() {
  const [popularTopics, setPopularTopics] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    questionCount: 0,
    userCount: 0,
    badgeCount: 0,
    groupCount: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 인기 게시글 가져오기
        const postsResponse = await forumService.getPosts({ 
          sort: 'popular',
          limit: 3
        });
        setPopularTopics(postsResponse.posts || []);

        // 활발한 사용자 가져오기
        const usersResponse = await forumService.getUsers({
          sort: 'contribution',
          limit: 5
        });
        setActiveUsers(usersResponse.users || []);

        // 통계 가져오기 - 이 부분은 실제 API가 있으면 해당 API를 호출해야 함
        // 임시 데이터로 설정
        setStats({
          questionCount: 32,
          userCount: 156,
          badgeCount: 24,
          groupCount: 8
        });
      } catch (error) {
        console.error("포럼 데이터 로딩 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sections = [
    {
      title: "토픽",
      description: "모든 토픽 목록을 확인하고 질문을 등록하세요.",
      icon: <MessageSquare className="h-8 w-8 text-blue-500" />,
      path: "/forum/topics",
      stats: `최근 등록된 질문: ${stats.questionCount}개`
    },
    {
      title: "사용자",
      description: "활발한 사용자 목록과 포인트 랭킹을 확인하세요.",
      icon: <Users className="h-8 w-8 text-green-500" />,
      path: "/forum/users",
      stats: `활동 중인 사용자: ${stats.userCount}명`
    },
    {
      title: "배지",
      description: "다양한 활동으로 칭호와 배지를 획득해보세요.",
      icon: <Award className="h-8 w-8 text-yellow-500" />,
      path: "/forum/badge",
      stats: `획득 가능한 배지: ${stats.badgeCount}개`
    },
    {
      title: "그룹",
      description: "관심사가 비슷한 사용자들과 함께 활동하세요.",
      icon: <UsersRound className="h-8 w-8 text-purple-500" />,
      path: "/forum/groups",
      stats: `활성 그룹: ${stats.groupCount}개`
    }
  ]

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">RoboSSAFYens 포럼</h1>
        <p className="text-gray-600">로봇 관련 질문과 지식을 공유하는 커뮤니티 포럼입니다.</p>
      </div>

      {/* 인기 토픽 */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">인기 토픽</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {popularTopics.length > 0 ? (
                popularTopics.map((topic) => (
                  <Link 
                    key={topic.id} 
                    href={`/forum/posts/${topic.id}`}
                    className="block p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-blue-600 hover:underline">{topic.title}</h3>
                      <span className="text-sm text-gray-500">답변: {topic.commentCount}</span>
                    </div>
                    <div className="mt-1 flex justify-between">
                      <span className="text-xs text-gray-500">작성자: {topic.author.username}</span>
                      <span className="text-xs text-gray-500">{formatDate(topic.createdAt)}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className="text-gray-500">아직 게시글이 없습니다.</p>
                </div>
              )}
            </div>
            <div className="p-4 text-right">
              <Link href="/forum/topics" className="text-blue-600 hover:underline">
                더 보기 →
              </Link>
            </div>
          </>
        )}
      </div>

      {/* 메뉴 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Link 
            key={section.title} 
            href={section.path}
            className="block"
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">{section.title}</CardTitle>
                <div className="rounded-full p-2 bg-gray-100">{section.icon}</div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-gray-600 mt-2">
                  {section.description}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-gray-500">{section.stats}</p>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      {/* 최근 활동 사용자 */}
      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">이달의 기여자</h2>
        {loading ? (
          <div className="text-center">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {activeUsers.length > 0 ? 
              activeUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                    {user.image ? (
                      <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-600 font-bold">{user.username[0].toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <Link href={`/forum/users/${user.username}`} className="font-medium hover:text-blue-600">
                      {user.username}
                    </Link>
                    <p className="text-xs text-gray-500">포인트: {user.postCount + user.commentCount * 2}</p>
                  </div>
                </div>
              ))
            : (
              <p className="text-gray-500">활동 중인 사용자가 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 