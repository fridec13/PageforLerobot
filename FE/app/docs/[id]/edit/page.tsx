import React from 'react';
import Link from 'next/link';

// 문서 편집 페이지
export default async function DocEditPage({
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
              
이 문서는 Mock 데이터를 표시하고 있습니다. 실제 API 연동 시 문서 내용이 표시됩니다.`
  };
  
  return (
    <div className="doc-edit-page">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">문서 수정: {document.title}</h1>
      </div>
      
      <form className="space-y-6">
        <div className="form-group">
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            제목
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="w-full p-2 border rounded"
            defaultValue={document.title}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            내용
          </label>
          <textarea
            id="content"
            name="content"
            rows={12}
            className="w-full p-2 border rounded font-mono"
            defaultValue={document.content}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="commitMessage" className="block text-sm font-medium mb-2">
            변경 요약
          </label>
          <input
            type="text"
            id="commitMessage"
            name="commitMessage"
            className="w-full p-2 border rounded"
            placeholder="무엇을 변경했는지 간략히 설명해주세요."
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            변경사항 제안
          </button>
          <Link
            href={`/docs/${id}`}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
} 