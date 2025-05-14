"use client"

import React from 'react';
import Link from 'next/link';
import { FileText, BookOpen, Cpu, LayersIcon, Code2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// 문서 목록 페이지
export default function DocsPage() {
  const categories = [
    {
      name: "roboDK",
      title: "RoboDK",
      description: "산업용 로봇 시뮬레이션 및 프로그래밍 소프트웨어",
      icon: <Cpu className="h-8 w-8 text-blue-500" />,
      path: "/docs/robodk",
      docsCount: 12
    },
    {
      name: "onshape",
      title: "Onshape",
      description: "클라우드 기반 3D CAD 설계 도구",
      icon: <LayersIcon className="h-8 w-8 text-green-500" />,
      path: "/docs/onshape",
      docsCount: 8
    },
    {
      name: "ros2",
      title: "ROS2",
      description: "로봇 운영체제 프레임워크",
      icon: <Code2 className="h-8 w-8 text-red-500" />,
      path: "/docs/ros2",
      docsCount: 10
    },
    {
      name: "lerobot",
      title: "LeRobot",
      description: "교육용 로봇 프로그래밍 플랫폼",
      icon: <BookOpen className="h-8 w-8 text-purple-500" />,
      path: "/docs/lerobot",
      docsCount: 6
    }
  ];
  
  const recentDocuments = [
    {
      id: "doc_1",
      title: "RoboDK API 활용 가이드",
      path: "/docs/doc_1",
      category: "RoboDK",
      updatedAt: "2025-05-12",
      author: "로봇마스터"
    },
    {
      id: "doc_2",
      title: "ROS2 Humble 설치 가이드",
      path: "/docs/doc_2",
      category: "ROS2",
      updatedAt: "2025-05-10",
      author: "코딩천재"
    },
    {
      id: "doc_3",
      title: "Onshape에서 로봇 부품 모델링하기",
      path: "/docs/doc_3",
      category: "Onshape",
      updatedAt: "2025-05-08",
      author: "테크노진"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">기술 문서</h1>
        <p className="text-gray-600">로봇 기술에 관한 다양한 가이드와 레퍼런스 문서를 제공합니다.</p>
      </div>
      
      {/* 최근 업데이트 문서 */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">최근 업데이트 문서</h2>
        </div>
        <div className="divide-y">
          {recentDocuments.map((doc) => (
            <Link 
              key={doc.id} 
              href={doc.path}
              className="block p-4 hover:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-blue-600 hover:underline">{doc.title}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    <span className="mr-3">카테고리: {doc.category}</span>
                    <span>작성자: {doc.author}</span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{doc.updatedAt}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="p-4 text-right">
          <Link href="/docs/recent" className="text-blue-600 hover:underline">
            더 보기 →
          </Link>
        </div>
      </div>

      {/* 카테고리 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {categories.map((category) => (
          <Link 
            key={category.name} 
            href={category.path}
            className="block"
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">{category.title}</CardTitle>
                <div className="rounded-full p-2 bg-gray-100">{category.icon}</div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-gray-600 mt-2">
                  {category.description}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-gray-500">문서 {category.docsCount}개</p>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
      
      {/* 문서 기여하기 섹션 */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-start">
          <div className="bg-blue-100 rounded-full p-3 mr-4">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">문서에 기여하기</h2>
            <p className="text-gray-600 mb-4">
              RoboSSAFYens 기술 문서는 커뮤니티의 기여로 발전합니다. 새로운 내용을 추가하거나 기존 내용을 개선해보세요.
            </p>
            <div className="flex space-x-4">
              <Link href="/docs/contribute" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                문서 작성하기
              </Link>
              <Link href="/docs/commit" className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50">
                변경 요청하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 