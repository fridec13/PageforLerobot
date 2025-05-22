"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Cpu, LayersIcon, Code2, BookOpen, ArrowUpRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import docsService, { Category, Document } from '@/lib/services/docsService';
import { LucideIcon } from 'lucide-react';

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

interface CategoryWithDocs extends Category {
  docsCount: number;
  popularDocs: Document[];
  color: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithDocs[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await docsService.getAllCategories();
        
        // 각 카테고리에 대한 인기 문서를 가져옴
        const categoriesWithDocs = await Promise.all(categoriesData.map(async (category) => {
          const documents = await docsService.getDocumentsByCategory(category.path);
          
          // 조회수 기준으로 정렬
          const sortedDocs = [...documents].sort((a, b) => (b.views || 0) - (a.views || 0));
          const popularDocs = sortedDocs.slice(0, 3);
          
          return {
            ...category,
            docsCount: documents.length,
            popularDocs,
            color: colorMap[category.id] || 'gray'
          };
        }));
        
        setCategories(categoriesWithDocs);
      } catch (error) {
        console.error('카테고리 로딩 중 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/docs" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>문서 목록으로 돌아가기</span>
        </Link>
        <h1 className="text-3xl font-bold mb-2">모든 카테고리</h1>
        <p className="text-gray-600">
          주제별로 분류된 기술 문서를 탐색하세요.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-500">카테고리를 불러오는 중...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {categories.map(category => (
            <div key={category.id} className="category-section">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-${category.color}-100`}>
                  {iconMap[category.icon || 'cpu'] || <Cpu className="h-8 w-8 text-blue-500" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{category.name}</h2>
                  <p className="text-gray-600">{category.description}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">인기 문서</h3>
                  <Link href={`/docs/${category.path}`} className="text-blue-600 hover:underline flex items-center text-sm">
                    모든 {category.name} 문서 보기 <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.popularDocs.length > 0 ? (
                    category.popularDocs.map(doc => (
                      <Card key={doc.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            <Link href={`/docs/${doc.id}`} className="text-blue-600 hover:underline">
                              {doc.title}
                            </Link>
                          </CardTitle>
                        </CardHeader>
                        <CardFooter className="pt-0">
                          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{category.name}</Badge>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <p className="text-gray-500 col-span-2 py-4 text-center">
                      이 카테고리에는 아직 문서가 없습니다.
                    </p>
                  )}
                </div>
              </div>
              
              <div className="border-b pb-6 mb-6 last:border-b-0"></div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-bold mb-3">더 많은 카테고리가 필요하신가요?</h2>
        <p className="mb-4">
          추가하고 싶은 카테고리나 주제가 있다면 제안해주세요.
        </p>
        <Link 
          href="/docs/suggestion" 
          className="inline-flex items-center justify-center px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          카테고리 제안하기
        </Link>
      </div>
    </div>
  );
} 