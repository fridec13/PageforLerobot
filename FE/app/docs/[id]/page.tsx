"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import EnhancedMarkdownViewer from '@/components/docs/EnhancedMarkdownViewer';
import DocTableOfContents from '@/components/docs/DocTableOfContents';
import DocToolbar from '@/components/docs/DocsToolbar';

// 샘플 마크다운 콘텐츠 생성 함수
const generateSampleContent = (id: string) => {
  if (id === 'doc_1') {
    return `# RoboDK 소개

RoboDK는 산업용 로봇 시뮬레이션 및 오프라인 프로그래밍 소프트웨어입니다. 다양한 로봇 제조사의 산업용 로봇을 지원하며, 직관적인 인터페이스로 로봇 프로그래밍과 시뮬레이션을 쉽게 할 수 있습니다.

## 주요 기능

* 40개 이상의 로봇 제조사 지원
* 동작 시뮬레이션 및 충돌 감지
* CAM 통합으로 가공 경로 생성
* Python API를 통한 로봇 프로그래밍

## 시스템 요구사항

| 구성 요소 | 최소 사양 | 권장 사양 |
| --------- | --------- | --------- |
| OS | Windows 7 (64비트) | Windows 10 (64비트) |
| CPU | Intel i5 | Intel i7 |
| RAM | 4GB | 8GB 이상 |
| 그래픽 | DirectX 11 지원 | 독립 그래픽(2GB 이상) |

\`\`\`warning
RoboDK는 가상 환경에서 로봇을 시뮬레이션합니다. 실제 로봇에 적용하기 전에 안전 검증이 필수적입니다.
\`\`\`

## RoboDK 인터페이스

![RoboDK 인터페이스](https://example.com/robodk-interface.png)

### 주요 패널

1. **로봇 트리**: 워크스페이스의 모든 항목을 계층 구조로 표시합니다.
2. **3D 뷰**: 로봇과 작업 환경을 3D로 표시합니다.
3. **명령 패널**: 로봇 명령을 생성하고 편집할 수 있습니다.

\`\`\`python
# RoboDK API 예제 코드
from robodk.robolink import *
from robodk.robomath import *

# RoboDK 연결 및 로봇 선택
RDK = Robolink()
robot = RDK.ItemByName('Fanuc LR Mate 200id')

# 대상 포즈 설정
target = RDK.ItemByName('Target 1')
pose = target.Pose()

# 로봇 이동
robot.MoveJ(pose)
\`\`\`

## 지원 로봇 제조사

* ABB
* FANUC
* KUKA
* Yaskawa Motoman
* Universal Robots
* 기타 30개 이상의 제조사

\`\`\`info
RoboDK에 대한 더 자세한 정보는 [공식 웹사이트](https://robodk.com/)에서 확인할 수 있습니다.
\`\`\``;
  } else if (id === 'doc_2') {
    return `# RoboDK 설치 가이드

이 가이드는 RoboDK 소프트웨어를 설치하는 단계별 방법을 제공합니다.

## 다운로드

1. [RoboDK 공식 웹사이트](https://robodk.com/download)에 접속합니다.
2. 운영 체제에 맞는 설치 파일을 다운로드합니다.
3. 라이센스 유형(무료 평가판 또는 유료 버전)을 선택합니다.

## 설치 과정

\`\`\`warning
설치하기 전에 이전 버전의 RoboDK를 완전히 제거하는 것이 좋습니다.
\`\`\`

1. 다운로드한 설치 파일을 실행합니다.
2. 라이센스 계약에 동의합니다.
3. 설치 디렉토리를 선택합니다.
4. 설치 옵션을 선택합니다.
5. '설치' 버튼을 클릭하여 설치를 시작합니다.

## 라이센스 활성화

\`\`\`info
무료 평가판은 30일 동안 모든 기능을 사용할 수 있습니다.
\`\`\`

1. RoboDK를 실행합니다.
2. 메뉴에서 '도움말 > 라이센스'를 선택합니다.
3. 구매한 라이센스 키를 입력하거나 평가판을 선택합니다.
4. '활성화' 버튼을 클릭합니다.

## 문제 해결

자주 발생하는 설치 문제에 대한 해결 방법:

| 문제 | 해결 방법 |
| ---- | --------- |
| 설치 실패 | 관리자 권한으로 설치 파일 실행 |
| 그래픽 문제 | 최신 그래픽 드라이버 설치 |
| 라이센스 오류 | 인터넷 연결 확인 후 재시도 |

\`\`\`success
설치가 완료되었습니다! 이제 RoboDK를 사용하여 로봇 프로그래밍과 시뮬레이션을 시작할 수 있습니다.
\`\`\``;
  } else {
    return `# ${id === 'doc_3' ? 'Onshape 기초' : 
            id === 'doc_4' ? 'ROS2 설치 가이드' :
            id === 'doc_5' ? 'RoboDK API 레퍼런스' :
            id === 'doc_6' ? '로봇 시뮬레이션' :
            id === 'doc_7' ? '외부 제어' :
            id === 'doc_8' ? 'CAD 모델링 가이드' :
            id === 'doc_9' ? 'ROS2 노드 생성' :
            'LeRobot 프로그래밍 가이드'}
            
이 문서는 개발 중입니다. 곧 내용이 추가될 예정입니다.

## 개요

이 페이지에서는 기본적인 내용을 다룹니다.

\`\`\`info
더 자세한 정보는 공식 문서를 참조하세요.
\`\`\``;
  }
};

export default function DocDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const { id } = params;
  const { user } = useAuth();
  const [documentData, setDocumentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // 실제 구현에서는 API 호출하여 문서 데이터 가져오기
    // 현재는 샘플 데이터 사용
    setTimeout(() => {
      setDocumentData({
        id,
        title: id === 'doc_1' ? 'RoboDK 소개' : 
               id === 'doc_2' ? 'RoboDK 설치 가이드' : 
               id === 'doc_3' ? 'Onshape 기초' :
               id === 'doc_4' ? 'ROS2 설치 가이드' :
               id === 'doc_5' ? 'RoboDK API 레퍼런스' :
               id === 'doc_6' ? '로봇 시뮬레이션' :
               id === 'doc_7' ? '외부 제어' :
               id === 'doc_8' ? 'CAD 모델링 가이드' :
               id === 'doc_9' ? 'ROS2 노드 생성' :
               'LeRobot 프로그래밍 가이드',
        content: generateSampleContent(id),
        updatedAt: '2025-05-15',
        lastEditedBy: 'admin',
        version: '1.2',
        views: 245
      });
      setIsLoading(false);
    }, 300);
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">문서를 불러오는 중...</p>
        </div>
      </div>
    );
  }
  
  if (!documentData) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold mb-2">문서를 찾을 수 없습니다</h1>
        <p className="text-gray-600 mb-4">요청하신 문서가 존재하지 않거나 삭제되었을 수 있습니다.</p>
        <Link 
          href="/docs" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          문서 목록으로
        </Link>
      </div>
    );
  }
  
  return (
    <div className="doc-detail-page">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 메인 콘텐츠 */}
        <div className="flex-1">
          <EnhancedMarkdownViewer content={documentData.content} />
          
          {/* 문서 도구바 */}
          <DocToolbar 
            documentId={id}
            lastUpdated={documentData.updatedAt}
            onFeedbackSubmit={(type: 'like' | 'dislike') => console.log('Feedback:', type)}
            onBookmark={() => console.log('Bookmarked')}
          />
        </div>
        
        {/* 오른쪽 사이드바 (목차) */}
        <div className="lg:w-64 order-first lg:order-last">
          <div className="lg:sticky lg:top-20">
            <DocTableOfContents />
            
            {/* 문서 메타데이터 */}
            <div className="bg-gray-50 rounded-md p-4 mt-4 text-sm">
              <h3 className="font-medium mb-2">문서 정보</h3>
              <div className="space-y-1 text-gray-600">
                <p>버전: {documentData.version}</p>
                <p>최종 수정: {documentData.updatedAt}</p>
                <p>조회수: {documentData.views}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}