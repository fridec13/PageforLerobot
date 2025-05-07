"use client"

import Link from "next/link"
import { ThumbsUp, MessageSquare, Eye } from "lucide-react"

export default function CommunityPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">커뮤니티</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">글쓰기</button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">인기 게시글</h2>
        </div>
        <div className="divide-y">
          {[1, 2, 3].map((item) => (
            <div key={item} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-lg">
                  <Link href={`/community/posts/${item}`} className="text-blue-600 hover:underline">
                    로봇 공학 분야에서 가장 유망한 직업은 무엇일까요?
                  </Link>
                </h3>
                <span className="text-sm text-gray-500">3일 전</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span className="mr-4">작성자: 로봇연구자</span>
                <div className="flex items-center mr-4">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  <span>32</span>
                </div>
                <div className="flex items-center mr-4">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>15</span>
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>128</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">최신 게시글</h2>
          <div className="flex space-x-2">
            <select className="border rounded px-2 py-1 text-sm">
              <option>최신순</option>
              <option>추천순</option>
              <option>조회순</option>
            </select>
            <input type="text" placeholder="검색" className="border rounded px-2 py-1 text-sm" />
            <button className="bg-gray-200 px-2 py-1 rounded text-sm">검색</button>
          </div>
        </div>
        <div className="divide-y">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-lg">
                  <Link href={`/community/posts/${item + 10}`} className="text-blue-600 hover:underline">
                    로봇 프로그래밍 입문자를 위한 추천 자료
                  </Link>
                </h3>
                <span className="text-sm text-gray-500">12시간 전</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span className="mr-4">작성자: 로봇초보</span>
                <div className="flex items-center mr-4">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  <span>8</span>
                </div>
                <div className="flex items-center mr-4">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>3</span>
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>42</span>
                </div>
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