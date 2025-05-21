"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Edit, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import docsService, { Document, Category } from '@/lib/services/docsService';

export default function ContributePage() {
  const [recommendedDocs, setRecommendedDocs] = useState<{
    category: string;
    docs: Document[];
  }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 인기 문서 가져오기
        const popularDocs = await docsService.getPopularDocuments(10);
        const categories = await docsService.getAllCategories();
        
        // 카테고리별로 인기 문서 그룹화
        const docsByCategory: Record<string, { category: string, docs: Document[] }> = {};
        
        for (const doc of popularDocs) {
          const category = categories.find(c => c.id === doc.categoryId);
          if (category) {
            if (!docsByCategory[category.id]) {
              docsByCategory[category.id] = {
                category: category.name,
                docs: []
              };
            }
            if (docsByCategory[category.id].docs.length < 2) {
              docsByCategory[category.id].docs.push(doc);
            }
          }
        }
        
        setRecommendedDocs(Object.values(docsByCategory).slice(0, 3));
      } catch (error) {
        console.error('인기 문서 로딩 중 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/docs" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>문서 목록으로 돌아가기</span>
        </Link>
        <h1 className="text-3xl font-bold mb-2">문서 둘러보기</h1>
        <p className="text-gray-600">
          RoboSSAFYens 기술 문서에서 필요한 정보를 찾아보세요.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              최신 문서
            </CardTitle>
            <CardDescription>최근에 추가되거나 업데이트된 문서입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/docs/recent" className="block text-blue-600 font-medium hover:underline">
              최신 문서 더 보기 →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              인기 문서
            </CardTitle>
            <CardDescription>사용자들이 가장 많이 읽은 문서입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/docs/popular" className="block text-blue-600 font-medium hover:underline">
              인기 문서 더 보기 →
            </Link>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">카테고리별 추천 문서</h2>
      {isLoading ? (
        <div className="text-center py-10">로딩 중...</div>
      ) : (
        <div className="space-y-8 mb-10">
          {recommendedDocs.map(category => (
            <div key={category.category}>
              <h3 className="text-xl font-semibold mb-3">{category.category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.docs.map(doc => (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">
                        <Link href={`/docs/${doc.id}`} className="text-blue-600 hover:underline">
                          {doc.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardFooter className="pt-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Badge className="mr-2">{category.category}</Badge>
                        <span>조회수: {(doc.views || 0).toLocaleString()}</span>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">문서에 기여하기</h2>
        <p className="mb-4">
          RoboSSAFYens 기술 문서는 커뮤니티의 기여로 발전합니다. 문서 작성 가이드를 확인하고 직접 참여해보세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/docs/guide" 
            className="inline-flex items-center justify-center px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FileText className="h-4 w-4 mr-2" />
            문서 작성 가이드
          </Link>
          <Link 
            href="/docs/suggestion" 
            className="inline-flex items-center justify-center px-5 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            변경 제안하기
          </Link>
        </div>
      </div>
    </div>
  );
} 