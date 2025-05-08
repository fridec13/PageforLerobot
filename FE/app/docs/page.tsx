import React from 'react';
import Link from 'next/link';

// 문서 목록 페이지
export default async function DocsPage() {
  // 실제로는 여기서 API를 호출하여 문서 목록을 가져옴
  // 지금은 Mock 데이터 사용
  
  return (
    <div className="docs-page">
      <h1 className="text-3xl font-bold mb-8">기술 문서</h1>
      
      <div className="docs-categories">
        <div className="category-section mb-8">
          <h2 className="text-2xl font-semibold mb-4">RoboDK</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentCard
              title="RoboDK 소개"
              path="/docs/doc_1"
              description="RoboDK의 기본 개념과 사용법에 대해 알아봅니다."
              date="2023-01-15"
            />
            <DocumentCard
              title="RoboDK 설치 가이드"
              path="/docs/doc_2"
              description="RoboDK를 설치하는 방법을 단계별로 안내합니다."
              date="2023-02-10"
            />
          </div>
        </div>
        
        <div className="category-section mb-8">
          <h2 className="text-2xl font-semibold mb-4">Onshape</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentCard
              title="Onshape 기초"
              path="/docs/doc_3"
              description="Onshape의 기본 기능과 인터페이스에 대해 알아봅니다."
              date="2023-02-01"
            />
          </div>
        </div>
        
        <div className="category-section mb-8">
          <h2 className="text-2xl font-semibold mb-4">ROS2</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentCard
              title="ROS2 설치 가이드"
              path="/docs/doc_4"
              description="ROS2를 설치하는 방법을 안내합니다."
              date="2023-03-05"
            />
          </div>
        </div>
        
        <div className="category-section mb-8">
          <h2 className="text-2xl font-semibold mb-4">LeRobot</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentCard
              title="LeRobot 프로그래밍 가이드"
              path="/docs/doc_5"
              description="LeRobot의 프로그래밍 방법에 대해 설명합니다."
              date="2023-04-15"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// 문서 카드 컴포넌트
function DocumentCard({ 
  title, 
  path, 
  description, 
  date 
}: { 
  title: string; 
  path: string; 
  description: string; 
  date: string; 
}) {
  return (
    <Link href={path} className="block">
      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-600 text-sm mt-2">{description}</p>
        <div className="text-gray-500 text-xs mt-3">
          마지막 수정: {date}
        </div>
      </div>
    </Link>
  );
} 