"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function ForumUsersPage() {
  const users = [
    { 
      id: 1, 
      name: "로봇마스터", 
      image: "https://api.dicebear.com/7.x/lorelei/svg?seed=user1",
      points: 3450, 
      posts: 87,
      replies: 214,
      title: "로봇 전문가",
      badges: ["기여왕", "문제해결사", "친절한 답변자"]
    },
    { 
      id: 2, 
      name: "테크노진", 
      image: "https://api.dicebear.com/7.x/lorelei/svg?seed=user2",
      points: 2871, 
      posts: 62,
      replies: 180,
      title: "RoboSSAFYens",
      badges: ["열정적인 기여자", "질문왕"]
    },
    { 
      id: 3, 
      name: "로봇애호가", 
      image: "https://api.dicebear.com/7.x/lorelei/svg?seed=user3",
      points: 2430, 
      posts: 51,
      replies: 128,
      title: "로봇 애호가",
      badges: ["문서 전문가", "하드웨어 마스터"]
    },
    { 
      id: 4, 
      name: "코딩천재", 
      image: "https://api.dicebear.com/7.x/lorelei/svg?seed=user4",
      points: 2150, 
      posts: 32,
      replies: 185,
      title: "RoboSSAFYens",
      badges: ["친절한 답변자", "코드 리뷰어"]
    },
    { 
      id: 5, 
      name: "인공지능연구원", 
      image: "https://api.dicebear.com/7.x/lorelei/svg?seed=user5",
      points: 1980, 
      posts: 43,
      replies: 94,
      title: "로봇 연구자",
      badges: ["AI 전문가"]
    },
    { 
      id: 6, 
      name: "메카닉스", 
      image: "https://api.dicebear.com/7.x/lorelei/svg?seed=user6",
      points: 1850, 
      posts: 21,
      replies: 120,
      title: "로봇 애호가",
      badges: ["하드웨어 마스터", "친절한 답변자"]
    },
    { 
      id: 7, 
      name: "프로그래밍고수", 
      image: "https://api.dicebear.com/7.x/lorelei/svg?seed=user7",
      points: 1780, 
      posts: 18,
      replies: 143,
      title: "코드 마스터",
      badges: ["문제해결사", "코드 리뷰어"]
    },
    { 
      id: 8, 
      name: "로봇공학도", 
      image: "https://api.dicebear.com/7.x/lorelei/svg?seed=user8",
      points: 1645, 
      posts: 29,
      replies: 86,
      title: "새싹",
      badges: ["열정적인 기여자"]
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">활동 사용자</h1>
        <div className="flex gap-2">
          <select className="border rounded p-2 text-sm">
            <option>포인트 순</option>
            <option>글 작성 순</option>
            <option>답변 순</option>
            <option>가입일 순</option>
          </select>
          <input 
            type="text" 
            placeholder="사용자 검색" 
            className="border rounded p-2 text-sm"
          />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">포인트 리더보드</h2>
        </div>
        <div className="divide-y">
          {users.map((user) => (
            <div key={user.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center">
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                        {user.title}
                      </Badge>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{user.points} 포인트</span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600 mb-2">
                    <span>질문: {user.posts}</span>
                    <span>답변: {user.replies}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {user.badges.map((badge, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-100">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">포인트 시스템 안내</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium mb-2">포인트 획득 방법</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>질문 작성: 5 포인트</li>
              <li>답변 작성: 10 포인트</li>
              <li>채택된 답변: 25 포인트</li>
              <li>좋아요 받기: 2 포인트</li>
              <li>문서 편집: 15 포인트</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">칭호 시스템</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>새싹</strong>: 기본 칭호</li>
              <li><strong>로봇 애호가</strong>: 500 포인트</li>
              <li><strong>로봇 전문가</strong>: 1500 포인트</li>
              <li><strong>로봇 연구자</strong>: 2000 포인트</li>
              <li><strong>RoboSSAFYens</strong>: 관리자 부여</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 