"use client"

import Link from "next/link"

export default function ForumTopicsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">포럼 토픽</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">최근 질문</h2>
          <Link href="/forum/topics/create">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">질문하기</button>
          </Link>
        </div>
        <div className="divide-y">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-lg">
                  <Link href={`/forum/topics/${item}`} className="text-blue-600 hover:underline">
                    RoboDK에서 로봇 경로 생성 시 오류가 발생합니다.
                  </Link>
                </h3>
                <span className="text-sm text-gray-500">2시간 전</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span className="mr-4">작성자: 로봇매니아</span>
                <span className="mr-4">답변: 3</span>
                <span>조회: 42</span>
              </div>
              <p className="text-gray-600 text-sm">
                RoboDK 최신 버전에서 로봇 경로를 생성하려고 할 때 "Invalid target" 오류가 발생합니다. 어떻게 해결할 수
                있을까요?
              </p>
              <div className="flex mt-2">
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded mr-2">RoboDK</span>
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">오류해결</span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 flex justify-center">
          <div className="flex space-x-1">
            <button className="px-3 py-1 rounded bg-gray-200">이전</button>
            <button className="px-3 py-1 rounded bg-blue-600 text-white">1</button>
            <button className="px-3 py-1 rounded bg-gray-200">2</button>
            <button className="px-3 py-1 rounded bg-gray-200">3</button>
            <button className="px-3 py-1 rounded bg-gray-200">다음</button>
          </div>
        </div>
      </div>
    </div>
  )
} 