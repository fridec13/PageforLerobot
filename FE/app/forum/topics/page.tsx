"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import forumService, { ForumPost } from "@/lib/services/forumService"
import { Search } from "lucide-react"

export default function ForumTopicsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") || "1");

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await forumService.getPosts({
          page: currentPage,
          limit: 10,
          sort: "latest",
          query: searchTerm,
          topicId: selectedCategory ? Number(selectedCategory) : undefined
        });
        setPosts(response.posts || []);
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error("게시글 로딩 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, searchTerm, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/forum/topics?page=1&search=${encodeURIComponent(searchTerm)}`);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/forum/topics?${params.toString()}`);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes}분 전`;
      }
      return `${diffHours}시간 전`;
    }
    
    return `${diffDays}일 전`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">포럼 토픽</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h2 className="text-xl font-bold">최근 질문</h2>
          <div className="flex flex-col md:flex-row gap-2 items-center">
            <form onSubmit={handleSearch} className="flex">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border rounded-l px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-gray-200 px-3 py-2 rounded-r text-sm hover:bg-gray-300"
              >
                검색
              </button>
            </form>
            <Link href="/forum/topics/create">
              <button className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                질문하기
              </button>
            </Link>
          </div>
        </div>
        <div className="divide-y">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">게시글을 불러오는 중...</p>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold text-lg">
                    <Link href={`/forum/posts/${post.id}`} className="text-blue-600 hover:underline">
                      {post.title}
                    </Link>
                  </h3>
                  <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span className="mr-4">작성자: {post.author.username}</span>
                  <span className="mr-4">답변: {post.commentCount}</span>
                  <span>조회: {post.viewCount}</span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {post.content}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex mt-2 flex-wrap gap-1">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">게시글이 없습니다.</p>
            </div>
          )}
        </div>
        {posts.length > 0 && (
          <div className="p-4 flex justify-center">
            <div className="flex space-x-1">
              <button 
                className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                이전
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <button
                    key={pageNumber}
                    className={`px-3 py-1 rounded ${currentPage === pageNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="self-center">...</span>
                  <button
                    className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <button 
                className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
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