"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText, Edit, Book, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GuidePage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/docs" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>문서 목록으로 돌아가기</span>
        </Link>
        <h1 className="text-3xl font-bold mb-2">문서 작성 가이드</h1>
        <p className="text-gray-600">
          기술 문서를 효과적으로 작성하고 편집하는 방법을 안내합니다.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full mb-10">
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="flex items-center">
            <Book className="mr-2 h-4 w-4" />
            개요
          </TabsTrigger>
          <TabsTrigger value="markdown" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            마크다운 문법
          </TabsTrigger>
          <TabsTrigger value="process" className="flex items-center">
            <Edit className="mr-2 h-4 w-4" />
            작성 및 수정 절차
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-3">문서 작성 목적</h2>
              <p className="mb-4">
                RoboSSAFYens 기술 문서는 로봇 공학 분야의 지식을 공유하고 체계화하기 위한 목적으로 작성됩니다. 
                문서는 다음과 같은 기준을 충족해야 합니다:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>정확하고 검증된 정보를 제공해야 합니다.</li>
                <li>명확하고 간결한 언어로 작성되어야 합니다.</li>
                <li>체계적인 구조로 정보를 조직해야 합니다.</li>
                <li>필요한 경우 코드 예제, 이미지, 도표를 포함해야 합니다.</li>
                <li>최신 정보를 유지해야 합니다.</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-3">권한과 역할</h2>
              <p className="mb-4">
                문서 시스템은 다음과 같은 권한 체계를 가집니다:
              </p>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">1. 일반 사용자</h3>
                  <p className="text-gray-600 pl-4">
                    - 모든 문서를 열람할 수 있습니다.<br />
                    - 문서 수정을 제안할 수 있습니다.<br />
                    - 문서에 대한 피드백을 제공할 수 있습니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">2. 모더레이터</h3>
                  <p className="text-gray-600 pl-4">
                    - 문서를 생성, 수정, 삭제할 수 있습니다.<br />
                    - 사용자의 수정 제안을 검토하고 승인할 수 있습니다.<br />
                    - 문서 카테고리를 관리할 수 있습니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">3. 관리자</h3>
                  <p className="text-gray-600 pl-4">
                    - 모든 문서 시스템을 관리할 수 있습니다.<br />
                    - 사용자 권한을 관리할 수 있습니다.<br />
                    - 문서 시스템 정책을 설정할 수 있습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="markdown" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-3">마크다운 기본 문법</h2>
              <p className="mb-4">
                문서는 마크다운 형식으로 작성됩니다. 주요 문법은 다음과 같습니다:
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">제목</h3>
                  <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto">
                    # 제목 1
                    ## 제목 2
                    ### 제목 3
                    #### 제목 4
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">강조</h3>
                  <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto">
                    *기울임체* 또는 _기울임체_
                    **굵게** 또는 __굵게__
                    ~~취소선~~
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">목록</h3>
                  <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto">
                    - 항목 1
                    - 항목 2
                      - 하위 항목

                    1. 첫 번째 항목
                    2. 두 번째 항목
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">링크와 이미지</h3>
                  <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto">
                    [링크 텍스트](URL)
                    ![이미지 설명](이미지 URL)
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">테이블</h3>
                  <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto">
                    | 제목1 | 제목2 |
                    |-------|-------|
                    | 내용1 | 내용2 |
                    | 내용3 | 내용4 |
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-3">특수 블록</h2>
              <p className="mb-4">
                문서에서 다음과 같은 특수 블록을 사용할 수 있습니다:
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-800">주의 블록</h3>
                    <pre className="bg-gray-100 mt-2 p-2 rounded-md overflow-x-auto">
                      ```warning
                      주의해야 할 내용을 여기에 작성합니다.
                      ```
                    </pre>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-800">정보 블록</h3>
                    <pre className="bg-gray-100 mt-2 p-2 rounded-md overflow-x-auto">
                      ```info
                      참고할 정보를 여기에 작성합니다.
                      ```
                    </pre>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-800">성공 블록</h3>
                    <pre className="bg-gray-100 mt-2 p-2 rounded-md overflow-x-auto">
                      ```success
                      성공 메시지나 완료 정보를 여기에 작성합니다.
                      ```
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-3">코드 블록</h2>
              <p className="mb-4">
                프로그래밍 코드를 포함할 때는 다음과 같이 작성합니다:
              </p>
              <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto mb-4">
                ```python
                def hello_world():
                    print("Hello, World!")
                    
                hello_world()
                ```
              </pre>
              <p>
                다양한 언어를 지원합니다: python, javascript, c, cpp, java, bash, yaml, json 등
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="process" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-3">문서 작성 절차</h2>
              <p className="mb-4">
                모더레이터와 관리자는 다음 절차를 통해 문서를 작성할 수 있습니다:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>관리자 페이지에서 "새 문서 작성" 버튼을 클릭합니다.</li>
                <li>문서 제목과 카테고리를 선택합니다.</li>
                <li>마크다운 편집기를 사용하여 내용을 작성합니다.</li>
                <li>미리보기를 통해 결과를 확인합니다.</li>
                <li>태그를 추가하고 관련 문서를 연결합니다.</li>
                <li>"게시" 버튼을 클릭하여 문서를 저장합니다.</li>
              </ol>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-3">문서 수정 제안 절차</h2>
              <p className="mb-4">
                일반 사용자는 다음 절차를 통해 문서 수정을 제안할 수 있습니다:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>문서 상단의 "수정 제안" 버튼을 클릭합니다.</li>
                <li>수정하고자 하는 내용을 편집합니다.</li>
                <li>수정 이유와 설명을 추가합니다.</li>
                <li>"제안 제출" 버튼을 클릭합니다.</li>
                <li>모더레이터가 검토 후 승인 또는 거부합니다.</li>
                <li>승인된 경우, 변경사항이 문서에 반영됩니다.</li>
              </ol>
              <div className="mt-4">
                <Link 
                  href="/docs/suggestion" 
                  className="inline-flex items-center justify-center px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  수정 제안하기
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-3">모범 사례</h2>
              <p className="mb-4">
                효과적인 문서 작성을 위한 모범 사례:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>명확성:</strong> 간결하고 이해하기 쉬운 언어를 사용하세요.</li>
                <li><strong>구조화:</strong> 논리적인 순서와 계층적인 제목을 사용하세요.</li>
                <li><strong>예시:</strong> 개념을 설명하는 구체적인 예시를 포함하세요.</li>
                <li><strong>시각화:</strong> 필요한 경우 다이어그램, 그래프, 이미지를 사용하세요.</li>
                <li><strong>메타데이터:</strong> 적절한 태그와 관련 문서를 연결하세요.</li>
                <li><strong>검토:</strong> 게시 전에 철자, 문법, 기술적 정확성을 검토하세요.</li>
                <li><strong>업데이트:</strong> 정기적으로 문서의 최신성을 유지하세요.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="border-t pt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600">
            질문이나 피드백이 있으시면 문의해주세요.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/docs/contribute" 
              className="inline-flex items-center justify-center px-5 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              문서 둘러보기
            </Link>
            <Link 
              href="/docs" 
              className="inline-flex items-center justify-center px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 