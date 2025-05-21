"use client";

import React, { useState, useEffect } from 'react';
import DocsHeader from '@/components/docs/DocsHeader';
import { useAuth } from '@/lib/auth';
import { usePathname } from 'next/navigation';
import { useSidebar, DocumentCategory } from '@/lib/contexts/SidebarContext';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 사용자 세션 및 권한 관리
  const { user } = useAuth();
  const userRole = user?.role || 'user';
  const pathname = usePathname();
  const { setMode, setDocCategories } = useSidebar();
  
  // 사이드바 데이터 (실제 구현 시 API 호출로 대체)
  const docsCategoriesData: DocumentCategory[] = [
    {
      id: "1",
      name: "RoboDK",
      slug: "robodk",
      documents: [
        { id: "doc_1", title: "RoboDK 소개", slug: "doc_1", categoryId: "1" },
        { id: "doc_2", title: "RoboDK 설치 가이드", slug: "doc_2", categoryId: "1" },
        { id: "doc_5", title: "RoboDK API 레퍼런스", slug: "doc_5", categoryId: "1" }
      ],
      subCategories: [
        {
          id: "1_1",
          name: "고급 기능",
          slug: "robodk-advanced",
          documents: [
            { id: "doc_6", title: "로봇 시뮬레이션", slug: "doc_6", categoryId: "1_1" },
            { id: "doc_7", title: "외부 제어", slug: "doc_7", categoryId: "1_1" }
          ]
        }
      ]
    },
    {
      id: "2",
      name: "Onshape",
      slug: "onshape",
      documents: [
        { id: "doc_3", title: "Onshape 기초", slug: "doc_3", categoryId: "2" },
        { id: "doc_8", title: "CAD 모델링 가이드", slug: "doc_8", categoryId: "2" }
      ]
    },
    {
      id: "3",
      name: "ROS2",
      slug: "ros2",
      documents: [
        { id: "doc_4", title: "ROS2 설치 가이드", slug: "doc_4", categoryId: "3" },
        { id: "doc_9", title: "ROS2 노드 생성", slug: "doc_9", categoryId: "3" }
      ]
    },
    {
      id: "4",
      name: "LeRobot",
      slug: "lerobot",
      documents: [
        { id: "doc_10", title: "LeRobot 프로그래밍 기초", slug: "doc_10", categoryId: "4" }
      ]
    }
  ];
  
  useEffect(() => {
    // docs 페이지로 들어오면 사이드바 모드를 'docs'로 변경
    setMode('docs');
    // 문서 카테고리 데이터 설정
    setDocCategories(docsCategoriesData);
    
    // 컴포넌트 언마운트 시 모드 되돌리기
    return () => {
      setMode('default');
    };
  }, [setMode, setDocCategories]);
  
  // 페이지 경로에 따라 현재 문서 정보 파악
  const isDetailPage = pathname !== '/docs' && !pathname.includes('/docs/admin');
  const currentDocId = isDetailPage ? pathname.split('/').pop() : '';
  const currentDoc = getDocumentById(currentDocId);
  
  // 문서 ID로 문서와 카테고리 정보 찾기
  function getDocumentById(docId: string | undefined) {
    if (!docId) return null;
    
    for (const category of docsCategoriesData) {
      // 카테고리 직속 문서 확인
      const doc = category.documents.find(d => d.slug === docId);
      if (doc) return { document: doc, category };
      
      // 서브 카테고리 문서 확인
      if (category.subCategories) {
        for (const subCategory of category.subCategories) {
          const subDoc = subCategory.documents.find(d => d.slug === docId);
          if (subDoc) return { document: subDoc, category: subCategory, parentCategory: category };
        }
      }
    }
    
    return null;
  }

  return (
    <div className="docs-layout min-h-screen flex flex-col">
      {/* 문서 헤더 */}
      <DocsHeader 
        title={currentDoc?.document?.title}
        category={currentDoc?.category?.name}
        categorySlug={currentDoc?.category?.slug}
        isDetailPage={isDetailPage}
        documentId={currentDocId}
        currentUserRole={userRole as any}
      />
      
      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* 푸터 영역 */}
      <footer className="bg-gray-50 py-6 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} RoboSSAFYens 기술 문서. 모든 권리 보유.</p>
        </div>
      </footer>
    </div>
  );
}
