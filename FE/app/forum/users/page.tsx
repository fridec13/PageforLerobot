"use client"

import { Suspense } from "react"
import ForumUsersList from "@/components/forum/ForumUsersList"

export default function ForumUsersPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">활동 사용자</h1>
      </div>

      <Suspense fallback={
        <div className="p-8 text-center bg-white shadow-md rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">사용자 목록을 불러오는 중...</p>
        </div>
      }>
        <ForumUsersList />
      </Suspense>

      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">포인트 시스템 안내</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium mb-2">포인트 획득 방법</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>질문 작성: 5 포인트</li>
              <li>답변 작성: 10 포인트</li>
              <li>채택된 답변: 25 포인트</li>
              <li>좋아요 받기: 2 포인트</li>
              <li>문서 편집: 15 포인트</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">칭호 시스템</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>새싹</strong>: 기본 칭호</li>
              <li><strong>로봇 애호가</strong>: 500 포인트</li>
              <li><strong>로봇 전문가</strong>: 1500 포인트</li>
              <li><strong>로봇 연구자</strong>: 2000 포인트</li>
              <li><strong>RoboSSAFYens</strong>: 관리자 부여</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 