import React from 'react';
import Link from 'next/link';

// 문서 상세 페이지
export default async function DocDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const { id } = params;
  
  // 실제로는 여기서 API를 호출하여 문서 정보를 가져옴
  // 지금은 Mock 데이터라고 가정
  const document = {
    id,
    title: id === 'doc_1' ? 'RoboDK 소개' : 
           id === 'doc_2' ? 'RoboDK 설치 가이드' : 
           id === 'doc_3' ? 'Onshape 기초' :
           id === 'doc_4' ? 'ROS2 설치 가이드' :
           'LeRobot 프로그래밍 가이드',
    content: `# ${id === 'doc_1' ? 'RoboDK 소개' : 
              id === 'doc_2' ? 'RoboDK 설치 가이드' : 
              id === 'doc_3' ? 'Onshape 기초' :
              id === 'doc_4' ? 'ROS2 설치 가이드' :
              'LeRobot 프로그래밍 가이드'}
              
이 문서는 Mock 데이터를 표시하고 있습니다. 실제 API 연동 시 문서 내용이 표시됩니다.`,
    updatedAt: new Date(),
    lastEditedBy: 'admin'
  };
  
  return (
    <div className="doc-detail-page">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{document.title}</h1>
        <div className="flex space-x-2">
          <Link 
            href={`/docs/${id}/edit`} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            수정
          </Link>
        </div>
      </div>
      
      <div className="doc-metadata mb-8">
        <div className="text-sm text-gray-500">
          최종 수정: {document.updatedAt.toLocaleDateString()}
          <span className="mx-2">|</span>
          편집자: {document.lastEditedBy}
        </div>
      </div>
      
      <div className="doc-content prose max-w-none">
        {/* 실제로는 여기서 마크다운을 HTML로 변환하여 표시 */}
        <div className="p-4 border rounded bg-gray-50">
          <pre className="whitespace-pre-wrap">{document.content}</pre>
        </div>
      </div>
      
      <div className="mt-8 pt-4 border-t">
        <Link href="/docs" className="text-blue-500 hover:underline">
          ← 문서 목록으로
        </Link>
      </div>
    </div>
  );
}