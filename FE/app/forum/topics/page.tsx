"use client"

import Link from "next/link"
import { Suspense } from "react"
import { Search } from "lucide-react"
import ForumTopicsList from "@/components/forum/ForumTopicsList"

export default function ForumTopicsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">포럼 토픽</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h2 className="text-xl font-bold">최근 질문</h2>
          <div className="flex flex-col md:flex-row gap-2 items-center">
            <Link href="/forum/topics/create">
              <button className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                질문하기
              </button>
            </Link>
          </div>
        </div>
        <Suspense fallback={
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">게시글을 불러오는 중...</p>
          </div>
        }>
          <ForumTopicsList />
        </Suspense>
      </div>
    </div>
  )
} 