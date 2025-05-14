"use client"

import Link from "next/link"
import { MessageSquare, Users, Award, UsersRound } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForumPage() {
  const sections = [
    {
      title: "토픽",
      description: "모든 토픽 목록을 확인하고 질문을 등록하세요.",
      icon: <MessageSquare className="h-8 w-8 text-blue-500" />,
      path: "/forum/topics",
      stats: "최근 등록된 질문: 32개"
    },
    {
      title: "사용자",
      description: "활발한 사용자 목록과 포인트 랭킹을 확인하세요.",
      icon: <Users className="h-8 w-8 text-green-500" />,
      path: "/forum/users",
      stats: "활동 중인 사용자: 156명"
    },
    {
      title: "배지",
      description: "다양한 활동으로 칭호와 배지를 획득해보세요.",
      icon: <Award className="h-8 w-8 text-yellow-500" />,
      path: "/forum/badge",
      stats: "획득 가능한 배지: 24개"
    },
    {
      title: "그룹",
      description: "관심사가 비슷한 사용자들과 함께 활동하세요.",
      icon: <UsersRound className="h-8 w-8 text-purple-500" />,
      path: "/forum/groups",
      stats: "활성 그룹: 8개"
    }
  ]

  const popularTopics = [
    { id: 1, title: "RoboDK에서 로봇 경로 생성 시 오류가 발생합니다.", replies: 8 },
    { id: 2, title: "OnShape 모델을 ROS2로 가져오는 방법이 궁금합니다.", replies: 12 },
    { id: 3, title: "로봇 컨트롤러 연결 문제 해결 방법", replies: 5 },
  ]

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
        <div className="divide-y">
          {popularTopics.map((topic) => (
            <Link 
              key={topic.id} 
              href={`/forum/topics/${topic.id}`}
              className="block p-4 hover:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-blue-600 hover:underline">{topic.title}</h3>
                <span className="text-sm text-gray-500">답변: {topic.replies}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="p-4 text-right">
          <Link href="/forum/topics" className="text-blue-600 hover:underline">
            더 보기 →
          </Link>
        </div>
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
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3, 4, 5].map((user) => (
            <div key={user} className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gray-300"></div>
              <div>
                <p className="font-medium">사용자{user}</p>
                <p className="text-xs text-gray-500">포인트: {200 - user * 20}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 