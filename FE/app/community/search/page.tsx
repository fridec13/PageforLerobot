"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ThumbsUp, MessageSquare, Eye, Search, ArrowLeft } from "lucide-react"
import communityService, { Post } from "@/lib/services/communityService"

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [searchTerm, setSearchTerm] = useState(query)
  const [searchResults, setSearchResults] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (query) {
      performSearch(query, currentPage);
    }
  }, [query, currentPage]);

  const performSearch = async (term: string, page = 1) => {
    if (!term.trim()) return;

    setLoading(true);
    try {
      const response = await communityService.searchPosts(term, { 
        page, 
        limit: 10 
      });
      setSearchResults(response.posts || []);
      setTotalResults(response.total || 0);
    } catch (error) {
      console.error("검색 오류:", error);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/community/search?q=${encodeURIComponent(searchTerm)}`)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 게시글 미리보기 텍스트 생성
  const createExcerpt = (content: string, maxLength = 150) => {
    if (!content || content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

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

      {/* 검색 폼 */}
      <form onSubmit={handleSearch} className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="검색어를 입력하세요"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
          >
            검색
          </button>
        </div>
        {query && (
          <div className="mt-2 text-sm text-gray-500">
            "{query}"에 대한 검색 결과: {totalResults}건
          </div>
        )}
      </form>

      {/* 검색 결과 */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">검색 중...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="divide-y">
            {searchResults.map((post) => (
              <div key={post.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold text-lg">
                    <Link href={`/community/posts/${post.id}`} className="text-blue-600 hover:underline">
                      {post.title}
                    </Link>
                  </h3>
                  <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
                </div>
                <p className="text-gray-600 mb-2 line-clamp-2">{createExcerpt(post.content)}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-4">작성자: {post.author.username}</span>
                  <div className="flex items-center mr-4">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span>{post.likeCount}</span>
                  </div>
                  <div className="flex items-center mr-4">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>{post.commentCount}</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{post.viewCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : query ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">'{query}'에 대한 검색 결과가 없습니다.</p>
            <p className="text-gray-400 mt-2">다른 검색어로 시도해보세요.</p>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">검색어를 입력하세요.</p>
          </div>
        )}

        {/* 페이징 */}
        {searchResults.length > 0 && totalResults > 10 && (
          <div className="p-4 flex justify-center">
            <div className="flex space-x-1">
              <button 
                className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                이전
              </button>
              
              {Array.from({ length: Math.ceil(totalResults / 10) }, (_, i) => i + 1)
                .filter(page => page <= 5) // 최대 5개 페이지만 표시
                .map(page => (
                  <button
                    key={page}
                    className={`px-3 py-1 rounded ${page === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))
              }
              
              {Math.ceil(totalResults / 10) > 5 && (
                <button 
                  className="px-3 py-1 rounded bg-gray-200"
                >
                  ...
                </button>
              )}
              
              <button 
                className={`px-3 py-1 rounded ${currentPage === Math.ceil(totalResults / 10) ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalResults / 10)))}
                disabled={currentPage === Math.ceil(totalResults / 10)}
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 