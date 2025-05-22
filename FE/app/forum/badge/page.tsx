"use client"

import React, { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Award, Crown, Star, BookOpen, MessageSquare, Heart, Zap, Flame, Trophy } from "lucide-react"
import forumService, { ForumBadge } from "@/lib/services/forumService"

export default function BadgePage() {
  // 활성 탭 상태
  const [activeTab, setActiveTab] = useState("all");
  const [badges, setBadges] = useState<(ForumBadge & { progress: number, total: number, acquired: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ 
    badgeCount: 0, 
    totalBadges: 0, 
    title: "새싹", 
    points: 0 
  });

  // 배지 아이콘 매핑 함수
  const getBadgeIcon = (name: string) => {
    const icons = {
      "새싹": <Award className="h-8 w-8 text-green-500" />,
      "로봇 애호가": <Crown className="h-8 w-8 text-blue-500" />,
      "로봇 전문가": <Star className="h-8 w-8 text-yellow-500" />,
      "문서 전문가": <BookOpen className="h-8 w-8 text-purple-500" />,
      "친절한 답변자": <MessageSquare className="h-8 w-8 text-blue-400" />,
      "열정적인 기여자": <Flame className="h-8 w-8 text-red-500" />,
      "문제해결사": <Zap className="h-8 w-8 text-amber-500" />,
      "인기 기여자": <Heart className="h-8 w-8 text-red-400" />,
      "RoboSSAFYens": <Trophy className="h-8 w-8 text-amber-600" />,
    };
    
    const lowerName = name.toLowerCase();
    // 이름에 포함된 키워드로 아이콘 찾기
    for (const [key, icon] of Object.entries(icons)) {
      if (lowerName.includes(key.toLowerCase())) {
        return icon;
      }
    }
    
    // 기본 아이콘
    return <Award className="h-8 w-8 text-gray-500" />;
  };

  useEffect(() => {
    const fetchBadges = async () => {
      setLoading(true);
      try {
        // 배지 목록 가져오기
        const response = await forumService.getBadges();
        
        // 획득 여부 및 진행도 정보 설정 - 실제 구현에서는 API에서 가져온 데이터로 설정
        const enhancedBadges = response.badges.map(badge => {
          // 임시 로직: 배지 ID가 1이면 이미 획득, 나머지는 진행 중
          const acquired = badge.id === 1;
          const progress = acquired ? 100 : Math.floor(Math.random() * 80);
          const total = 100;
          
          return {
            ...badge,
            acquired,
            progress,
            total
          };
        });
        
        setBadges(enhancedBadges);
        
        // 사용자 배지 통계 설정 - 실제 구현에서는 API를 통해 가져온 데이터로 설정
        setUserStats({
          badgeCount: 1,
          totalBadges: enhancedBadges.length,
          title: "새싹",
          points: 320
        });
      } catch (error) {
        console.error("배지 로딩 오류:", error);
        // 에러 시 기본 데이터로 대체
        setBadges([
          {
            id: 1,
            name: "새싹",
            description: "가입을 완료한 사용자",
            criteria: "가입 완료 시 자동 획득",
            categoryId: 1,
            image: "",
            createdAt: new Date().toISOString(),
            progress: 100,
            total: 100,
            acquired: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  // 카테고리별 필터링
  const getBadgeCategory = (badge: ForumBadge) => {
    const categories = ["기본", "활동", "기여", "포럼", "특별"];
    // 카테고리ID가 범위를 벗어나면 기본 카테고리 반환
    return categories[(badge.categoryId || 1) - 1] || "기본";
  };

  const filteredBadges = activeTab === "all" 
    ? badges 
    : badges.filter(badge => getBadgeCategory(badge) === activeTab);

  // 보유/미보유 분류
  const acquiredBadges = badges.filter(badge => badge.acquired);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">배지 정보를 불러오는 중...</p>
      </div>
    );
  }

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
            <Badge className="bg-blue-100 text-blue-800">{userStats.badgeCount}/{userStats.totalBadges}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">현재 칭호:</span>
            <Badge className="bg-green-100 text-green-800">{userStats.title}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">포인트:</span>
            <Badge className="bg-purple-100 text-purple-800">{userStats.points}</Badge>
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
              {filteredBadges.length > 0 ? (
                filteredBadges.map((badge) => (
                  <div key={badge.id} className="p-4">
                    <div className="flex items-start">
                      <div className={`p-3 rounded-lg mr-4 ${badge.acquired ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {badge.image ? (
                          <img src={badge.image} alt={badge.name} className="h-8 w-8" />
                        ) : getBadgeIcon(badge.name)}
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
                          <span>{badge.criteria}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">해당 카테고리의 배지가 없습니다.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* 각 카테고리 탭 */}
          {["기본", "활동", "기여", "포럼", "특별"].map(category => (
            <TabsContent key={category} value={category} className="p-0">
              <div className="divide-y">
                {filteredBadges.length > 0 ? (
                  filteredBadges.map((badge) => (
                    <div key={badge.id} className="p-4">
                      <div className="flex items-start">
                        <div className={`p-3 rounded-lg mr-4 ${badge.acquired ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          {badge.image ? (
                            <img src={badge.image} alt={badge.name} className="h-8 w-8" />
                          ) : getBadgeIcon(badge.name)}
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
                            <span>{badge.criteria}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">해당 카테고리의 배지가 없습니다.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
} 