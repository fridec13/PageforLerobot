"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UsersRound, Lock, Unlock, Search, Plus, MoreHorizontal } from "lucide-react"

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // 그룹 데이터
  const groups = [
    {
      id: 1,
      name: "RoboDK 개발자 모임",
      description: "RoboDK API 개발과 관련된 정보를 공유하고 문제를 함께 해결하는 그룹입니다.",
      memberCount: 42,
      isPrivate: false,
      category: "개발",
      image: "https://api.dicebear.com/7.x/identicon/svg?seed=robodk",
      lastActive: "오늘",
      topics: 28,
      replies: 156,
      views: 1250,
      isMember: true
    },
    {
      id: 2,
      name: "로봇 알고리즘 연구",
      description: "로봇 제어 알고리즘과 인공지능 적용에 관심있는 연구자들의 모임입니다.",
      memberCount: 36,
      isPrivate: false,
      category: "연구",
      image: "https://api.dicebear.com/7.x/identicon/svg?seed=algorithm",
      lastActive: "어제",
      topics: 45,
      replies: 210,
      views: 1890,
      isMember: false
    },
    {
      id: 3,
      name: "ROS2 스터디",
      description: "ROS2를 함께 공부하고 프로젝트를 진행하는 스터디 그룹입니다.",
      memberCount: 28,
      isPrivate: false,
      category: "스터디",
      image: "https://api.dicebear.com/7.x/identicon/svg?seed=ros2",
      lastActive: "3일 전",
      topics: 19,
      replies: 87,
      views: 950,
      isMember: true
    },
    {
      id: 4,
      name: "로봇 하드웨어 디자인",
      description: "로봇 하드웨어 설계와 3D 프린팅에 관심 있는 사람들의 모임입니다.",
      memberCount: 24,
      isPrivate: false,
      category: "하드웨어",
      image: "https://api.dicebear.com/7.x/identicon/svg?seed=hardware",
      lastActive: "1주일 전",
      topics: 16,
      replies: 52,
      views: 680,
      isMember: false
    },
    {
      id: 5,
      name: "로봇 프로젝트 협업",
      description: "실제 로봇 프로젝트를 함께 진행하고 협업하는 그룹입니다.",
      memberCount: 19,
      isPrivate: true,
      category: "프로젝트",
      image: "https://api.dicebear.com/7.x/identicon/svg?seed=project",
      lastActive: "오늘",
      topics: 32,
      replies: 178,
      views: 980,
      isMember: false
    },
    {
      id: 6,
      name: "로봇 시뮬레이션 전문가",
      description: "로봇 시뮬레이션 도구와 기술에 관심있는 사람들의 모임입니다.",
      memberCount: 31,
      isPrivate: false,
      category: "시뮬레이션",
      image: "https://api.dicebear.com/7.x/identicon/svg?seed=simulation",
      lastActive: "2일 전",
      topics: 26,
      replies: 124,
      views: 1420,
      isMember: true
    },
  ];

  // 검색 기능
  const filteredGroups = searchQuery.trim() === "" 
    ? groups 
    : groups.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  // 나의 그룹과 모든 그룹 분류
  const myGroups = groups.filter(group => group.isMember);
  const otherGroups = groups.filter(group => !group.isMember);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">그룹</h1>
          <p className="text-gray-600">
            특정 주제나 관심사에 따라 그룹을 만들고 참여해 보세요.
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" asChild>
          <Link href="/forum/groups/create">
            <Plus className="h-4 w-4 mr-2" />
            새 그룹 만들기
          </Link>
        </Button>
      </div>
      
      {/* 검색 및 필터 */}
      <div className="flex items-center mb-8 gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="그룹 검색" 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="border rounded p-2 text-sm">
          <option>최근 활동순</option>
          <option>멤버 수</option>
          <option>인기순</option>
          <option>이름순</option>
        </select>
      </div>
      
      {/* 내 그룹 */}
      {myGroups.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">내가 참여 중인 그룹</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myGroups.map(group => (
              <Link key={group.id} href={`/forum/groups/${group.id}`} className="block">
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={group.image} alt={group.name} />
                        <AvatarFallback>{group.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          <Badge className="bg-blue-100 text-blue-800">{group.category}</Badge>
                          {group.isPrivate ? (
                            <Badge className="bg-gray-100 text-gray-800">
                              <Lock className="h-3 w-3 mr-1" />
                              비공개
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">
                              <Unlock className="h-3 w-3 mr-1" />
                              공개
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm line-clamp-2 mt-2">
                      {group.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="text-xs text-gray-500 flex justify-between">
                    <div className="flex items-center">
                      <UsersRound className="h-3 w-3 mr-1" /> {group.memberCount}명
                    </div>
                    <div>
                      최근 활동: {group.lastActive}
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* 모든 그룹 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">모든 그룹</h2>
        {filteredGroups.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-500">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGroups.map(group => (
              <Link key={group.id} href={`/forum/groups/${group.id}`} className="block">
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={group.image} alt={group.name} />
                        <AvatarFallback>{group.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          <Badge className="bg-blue-100 text-blue-800">{group.category}</Badge>
                          {group.isPrivate ? (
                            <Badge className="bg-gray-100 text-gray-800">
                              <Lock className="h-3 w-3 mr-1" />
                              비공개
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">
                              <Unlock className="h-3 w-3 mr-1" />
                              공개
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {group.isMember && (
                      <Badge className="bg-green-100 text-green-800">참여 중</Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm line-clamp-2 mt-2">
                      {group.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="text-xs text-gray-500 flex justify-between">
                    <div className="flex items-center">
                      <UsersRound className="h-3 w-3 mr-1" /> {group.memberCount}명
                    </div>
                    <div className="flex gap-3">
                      <span>토픽: {group.topics}</span>
                      <span>답변: {group.replies}</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 그룹 가이드 */}
      <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3">그룹 이용 안내</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
          <li>그룹은 특정 주제나 관심사에 따라 사용자들이 모여 활동하는 공간입니다.</li>
          <li>공개 그룹은 누구나 자유롭게 참여하고 콘텐츠를 볼 수 있습니다.</li>
          <li>비공개 그룹은 초대를 통해서만 참여할 수 있으며, 그룹 내용은 멤버만 볼 수 있습니다.</li>
          <li>그룹 내에서 토픽을 생성하고 토론할 수 있습니다.</li>
          <li>그룹 활동은 프로필 페이지에 표시되며, 활발한 활동으로 배지를 획득할 수 있습니다.</li>
        </ul>
      </div>
    </div>
  )
} 