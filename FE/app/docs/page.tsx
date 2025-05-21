"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FileText, BookOpen, Cpu, LayersIcon, Code2, ArrowUpRight, Clock, Users, Star, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import docsService, { Document, Category } from '@/lib/services/docsService';

// 아이콘 매핑
const iconMap: Record<string, React.ReactNode> = {
  'cpu': <Cpu className="h-8 w-8 text-blue-500" />,
  'layers': <LayersIcon className="h-8 w-8 text-green-500" />,
  'code-2': <Code2 className="h-8 w-8 text-red-500" />,
  'book-open': <BookOpen className="h-8 w-8 text-purple-500" />
};

// 색상 매핑
const colorMap: Record<string, string> = {
  'cat_robodk': 'blue',
  'cat_onshape': 'green', 
  'cat_ros2': 'red',
  'cat_lerobot': 'purple'
};

// 문서 목록 페이지
export default function DocsPage() {
  const [categories, setCategories] = useState<(Category & { docsCount: number, color: string })[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [popularDocuments, setPopularDocuments] = useState<Document[]>([]);
  const [topContributors, setTopContributors] = useState([
    {
      id: "user1",
      name: "로봇마스터",
      image: "/images/avatar.png",
      docs: 28,
      role: "운영자"
    },
    {
      id: "user2",
      name: "코딩천재",
      image: "/images/avatar.png",
      docs: 15,
      role: "모더레이터"
    },
    {
      id: "user3",
      name: "테크노진",
      image: "/images/avatar.png",
      docs: 7,
      role: "기여자"
    }
  ]);
  const [isLoading, setIsLoading] = useState({
    categories: true,
    recent: true,
    popular: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 카테고리 데이터 로드
        const categoriesData = await docsService.getAllCategories();
        const categoriesWithMeta = await Promise.all(
          categoriesData.map(async category => {
            const docs = await docsService.getDocumentsByCategory(category.path);
            return {
              ...category,
              docsCount: docs.length,
              color: colorMap[category.id] || 'gray'
            };
          })
        );
        setCategories(categoriesWithMeta);
        setIsLoading(prev => ({ ...prev, categories: false }));

        // 최근 문서 로드
        const recentDocs = await docsService.getRecentDocuments(3);
        setRecentDocuments(recentDocs);
        setIsLoading(prev => ({ ...prev, recent: false }));

        // 인기 문서 로드
        const popularDocs = await docsService.getPopularDocuments(3);
        setPopularDocuments(popularDocs);
        setIsLoading(prev => ({ ...prev, popular: false }));
      } catch (error) {
        console.error('데이터 로딩 중 오류:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 섹션 */}
      <div className="text-center mb-12 py-12">
        <h1 className="text-4xl font-bold mb-4">기술 문서</h1>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-8">
          로봇 기술에 관한 다양한 가이드와 레퍼런스 문서를 제공합니다. 
          기술 문서는 모더레이터와 관리자가 작성하며, 사용자는 수정 제안을 할 수 있습니다.
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            href="/docs/contribute" 
            className="inline-flex items-center justify-center px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            문서 둘러보기
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
          <Link 
            href="/docs/guide" 
            className="inline-flex items-center justify-center px-5 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            문서 작성 가이드
          </Link>
        </div>
      </div>
      
      {/* 카테고리 섹션 */}
      <div className="mb-16">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold">문서 카테고리</h2>
          <Link href="/docs/categories" className="text-blue-600 hover:underline flex items-center">
            모든 카테고리 <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {isLoading.categories ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/docs/${category.path}`}
                className="block"
              >
                <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden border-l-4" style={{ borderLeftColor: `var(--${category.color}-500)` }}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                    <div className="rounded-full p-2 bg-gray-100">
                      {iconMap[category.icon || 'cpu'] || <Cpu className="h-8 w-8 text-blue-500" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-gray-600 mt-2">
                      {category.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <p className="text-xs text-gray-500">문서 {category.docsCount}개</p>
                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">자세히</Badge>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* 문서 탭 섹션 */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6">문서 살펴보기</h2>
        
        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="recent" className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              최근 업데이트
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex items-center">
              <Star className="mr-2 h-4 w-4" />
              인기 문서
            </TabsTrigger>
            <TabsTrigger value="contributors" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              기여자
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="space-y-6">
            {isLoading.recent ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                {recentDocuments.map((doc) => {
                  // 날짜 포맷팅
                  const updatedDate = new Date(doc.updatedAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  });
                  
                  // 내용에서 발췌문 추출 (첫 100자)
                  const excerpt = doc.content
                    .replace(/#+\s+.*\n+/g, '') // 제목 제거
                    .replace(/\!\[.*\]\(.*\)/g, '') // 이미지 제거
                    .replace(/\[.*\]\(.*\)/g, '$1') // 링크 텍스트만 남김
                    .replace(/\*\*|\*|~~|__|\||>/g, '') // 마크다운 서식 제거
                    .substring(0, 100) + '...';
                  
                  return (
                    <Card key={doc.id} className="overflow-hidden">
                      <Link href={`/docs/${doc.id}`}>
                        <div className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between mb-2">
                            <Badge className="mb-2 bg-gray-100 text-gray-800 hover:bg-gray-200">
                              {categories.find(c => c.id === doc.categoryId)?.name || 'Unknown'}
                            </Badge>
                            <span className="text-xs text-gray-500">{updatedDate}</span>
                          </div>
                          <h3 className="text-xl font-semibold mb-2 text-blue-600">{doc.title}</h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">{excerpt}</p>
                          
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mr-3">
                              <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">
                                {doc.lastEditedBy.substring(0, 2).toUpperCase()}
                              </div>
                            </div>
                            <span className="text-sm text-gray-700">{doc.lastEditedBy}</span>
                          </div>
                        </div>
                      </Link>
                    </Card>
                  );
                })}
                
                <div className="text-center">
                  <Link 
                    href="/docs/recent" 
                    className="inline-flex items-center justify-center px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    더 많은 문서 보기
                  </Link>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="popular" className="space-y-4">
            {isLoading.popular ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                {popularDocuments.map((doc, index) => (
                  <Link key={doc.id} href={`/docs/${doc.id}`}>
                    <Card className="hover:shadow-md transition-shadow">
                      <div className="p-4 flex items-center">
                        <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-700 font-medium mr-4">
                          {index + 1}
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-blue-600">{doc.title}</h3>
                          <p className="text-xs text-gray-500">
                            {categories.find(c => c.id === doc.categoryId)?.name || 'Unknown'} · 
                            조회수 {(doc.views || 0).toLocaleString()}
                          </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </Card>
                  </Link>
                ))}
                
                <div className="text-center pt-4">
                  <Link 
                    href="/docs/popular" 
                    className="inline-flex items-center justify-center px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    인기 문서 더 보기
                  </Link>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="contributors" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topContributors.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                  <div className="p-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden mx-auto mb-4">
                      {user.image && (
                        <Image
                          src={user.image}
                          alt={user.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{user.name}</h3>
                    <Badge className="mb-3 bg-gray-100 text-gray-800 hover:bg-gray-200">{user.role}</Badge>
                    <p className="text-gray-600">작성 문서 {user.docs}개</p>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="text-center">
              <Link 
                href="/docs/contributors" 
                className="inline-flex items-center justify-center px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                모든 기여자 보기
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* 문서 기여하기 섹션 */}
      <div className="bg-blue-50 rounded-xl p-8 mb-16">
        <div className="flex flex-col md:flex-row items-center">
          <div className="mb-6 md:mb-0 md:mr-8">
            <div className="bg-blue-100 rounded-full p-4 inline-block">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-2">문서에 기여하기</h2>
            <p className="text-gray-600 mb-4 max-w-2xl">
              RoboSSAFYens 기술 문서는 커뮤니티의 기여로 발전합니다. 
              새로운 내용을 추가하거나 기존 내용에 대한 개선 제안을 해보세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/docs/suggestion" 
                className="inline-flex items-center justify-center px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                변경 제안하기
              </Link>
              <Link 
                href="/docs/guide" 
                className="inline-flex items-center justify-center px-5 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                문서 작성 가이드 보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 