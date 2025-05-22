"use client"

import { Suspense } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import SearchResults from "@/components/community/SearchResults"

export default function SearchPage() {
  const router = useRouter()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push("/community")}
          className="flex items-center text-blue-600 hover:underline mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>커뮤니티로 돌아가기</span>
        </button>
        <h1 className="text-3xl font-bold">검색 결과</h1>
      </div>

      <Suspense fallback={
        <div className="p-8 text-center bg-white shadow-md rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">검색 중...</p>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  )
} 