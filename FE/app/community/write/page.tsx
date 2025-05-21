"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import communityService from "@/lib/services/communityService"

export default function WritePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("일반")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const postData = {
        title,
        content,
        category
      }

      const response = await communityService.createPost(postData);
      router.push(`/community/posts/${response.id}`);
    } catch (error) {
      console.error("게시글 등록 오류:", error);
      setError("게시글 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">게시글 작성</h1>
        <p className="text-gray-500">커뮤니티에 새 글을 작성합니다.</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="category">
            카테고리
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded px-3 py-2"
            disabled={loading}
          >
            <option value="일반">일반</option>
            <option value="질문">질문</option>
            <option value="정보">정보</option>
            <option value="후기">후기</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="title">
            제목
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="제목을 입력하세요"
            required
            disabled={loading}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="content">
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border rounded px-3 py-2 h-64"
            placeholder="내용을 입력하세요"
            required
            disabled={loading}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? "등록 중..." : "등록하기"}
          </button>
        </div>
      </form>
    </div>
  )
} 