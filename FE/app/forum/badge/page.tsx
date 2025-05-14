"use client"

import React, { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Award, Crown, Star, BookOpen, MessageSquare, Heart, Zap, Flame, Trophy } from "lucide-react"

export default function BadgePage() {
  // 활성 탭 상태
  const [activeTab, setActiveTab] = useState("all");

  // 배지/칭호 데이터
  const badges = [
    {
      id: 1,
      name: "새싹",
      description: "가입을 완료한 사용자",
      category: "기본",
      icon: <Award className="h-8 w-8 text-green-500" />,
      progress: 100,
      total: 100,
      acquired: true,
      unlockCondition: "가입 완료 시 자동 획득"
    },
    {
      id: 2,
      name: "로봇 애호가",
      description: "500 포인트를 획득한 사용자",
      category: "활동",
      icon: <Crown className="h-8 w-8 text-blue-500" />,
      progress: 320,
      total: 500,
      acquired: false,
      unlockCondition: "포럼 활동으로 500 포인트 획득"
    },
    {
      id: 3,
      name: "로봇 전문가",
      description: "1500 포인트를 획득한 사용자",
      category: "활동",
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      progress: 320,
      total: 1500,
      acquired: false,
      unlockCondition: "포럼 활동으로 1500 포인트 획득"
    },
    {
      id: 4,
      name: "문서 전문가",
      description: "문서 10개 이상 작성 또는 수정",
      category: "기여",
      icon: <BookOpen className="h-8 w-8 text-purple-500" />,
      progress: 4,
      total: 10,
      acquired: false,
      unlockCondition: "기술 문서 10개 이상 작성 또는 수정"
    },
    {
      id: 5,
      name: "친절한 답변자",
      description: "채택된 답변 5개 이상",
      category: "포럼",
      icon: <MessageSquare className="h-8 w-8 text-blue-400" />,
      progress: 3,
      total: 5,
      acquired: false,
      unlockCondition: "포럼에서 5개 이상의 채택된 답변 작성"
    },
    {
      id: 6,
      name: "열정적인 기여자",
      description: "모든 카테고리에서 기여 활동",
      category: "기여",
      icon: <Flame className="h-8 w-8 text-red-500" />,
      progress: 3,
      total: 5,
      acquired: false,
      unlockCondition: "모든 섹션(문서, 위키, 포럼 등)에서 최소 1회 이상 기여"
    },
    {
      id: 7,
      name: "문제해결사",
      description: "포럼에서 10개 이상의 질문 해결",
      category: "포럼",
      icon: <Zap className="h-8 w-8 text-amber-500" />,
      progress: 6,
      total: 10,
      acquired: false,
      unlockCondition: "포럼에서 10개 이상의 질문에 채택된 답변 제공"
    },
    {
      id: 8,
      name: "인기 기여자",
      description: "작성한 콘텐츠가 50개 이상의 좋아요를 받음",
      category: "인기",
      icon: <Heart className="h-8 w-8 text-red-400" />,
      progress: 28,
      total: 50,
      acquired: false,
      unlockCondition: "작성한 콘텐츠(문서, 위키, 포럼 답변 등)가 누적 50개 이상의 좋아요 받기"
    },
    {
      id: 9,
      name: "RoboSSAFYens",
      description: "관리자에 의해 부여되는 특별 칭호",
      category: "특별",
      icon: <Trophy className="h-8 w-8 text-amber-600" />,
      progress: 0,
      total: 100,
      acquired: false,
      unlockCondition: "뛰어난 기여와 활동으로 관리자에 의해 부여"
    },
  ];

  // 카테고리별 필터링
  const filteredBadges = activeTab === "all" 
    ? badges 
    : badges.filter(badge => badge.category.toLowerCase() === activeTab);

  // 보유/미보유 분류
  const acquiredBadges = badges.filter(badge => badge.acquired);
  const unacquiredBadges = badges.filter(badge => !badge.acquired);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">배지 및 칭호</h1>
        <p className="text-gray-600">
          다양한 활동과 기여를 통해 특별한 배지와 칭호를 획득하세요.
          획득한 칭호는 프로필과 작성글에 표시됩니다.
        </p>
      </div>

      {/* 내 배지 요약 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">내 배지 현황</h2>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">보유한 배지:</span>
            <Badge className="bg-blue-100 text-blue-800">{acquiredBadges.length}/{badges.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">현재 칭호:</span>
            <Badge className="bg-green-100 text-green-800">새싹</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">포인트:</span>
            <Badge className="bg-purple-100 text-purple-800">320</Badge>
          </div>
        </div>
      </div>

      {/* 배지 목록 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <div className="px-6 pt-4 pb-4 border-b">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="기본">기본</TabsTrigger>
              <TabsTrigger value="활동">활동</TabsTrigger>
              <TabsTrigger value="기여">기여</TabsTrigger>
              <TabsTrigger value="포럼">포럼</TabsTrigger>
              <TabsTrigger value="특별">특별</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="p-0">
            <div className="divide-y">
              {filteredBadges.map((badge) => (
                <div key={badge.id} className="p-4">
                  <div className="flex items-start">
                    <div className={`p-3 rounded-lg mr-4 ${badge.acquired ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {badge.icon}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between mb-1">
                        <div>
                          <h3 className="font-semibold text-lg">{badge.name}</h3>
                          <p className="text-sm text-gray-600 mb-1">{badge.description}</p>
                        </div>
                        <Badge 
                          className={badge.acquired 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"}
                        >
                          {badge.acquired ? "획득" : "미획득"}
                        </Badge>
                      </div>
                      <div className="mb-1">
                        <Progress 
                          value={(badge.progress / badge.total) * 100} 
                          className="h-2"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>진행도: {badge.progress}/{badge.total}</span>
                        <span>{badge.unlockCondition}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          {/* 다른 탭들도 동일한 내용 */}
          <TabsContent value="기본" className="p-0">
            <div className="divide-y">
              {filteredBadges.map((badge) => (
                <div key={badge.id} className="p-4">
                  {/* 위와 동일한 배지 카드 내용 */}
                  <div className="flex items-start">
                    <div className={`p-3 rounded-lg mr-4 ${badge.acquired ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {badge.icon}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between mb-1">
                        <div>
                          <h3 className="font-semibold text-lg">{badge.name}</h3>
                          <p className="text-sm text-gray-600 mb-1">{badge.description}</p>
                        </div>
                        <Badge 
                          className={badge.acquired 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"}
                        >
                          {badge.acquired ? "획득" : "미획득"}
                        </Badge>
                      </div>
                      <div className="mb-1">
                        <Progress 
                          value={(badge.progress / badge.total) * 100} 
                          className="h-2"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>진행도: {badge.progress}/{badge.total}</span>
                        <span>{badge.unlockCondition}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          {/* 나머지 탭 내용도 동일하게 반복 (활동, 기여, 포럼, 특별) */}
        </Tabs>
      </div>
    </div>
  )
} 