"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ThumbsUp, MessageSquare, Eye } from "lucide-react"
import communityService, { Post } from "@/lib/services/communityService"

export default function CommunityPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [popularPosts, setPopularPosts] = useState<Post[]>([])
  const [latestPosts, setLatestPosts] = useState<Post[]>([])
  const [sortOrder, setSortOrder] = useState<"latest" | "popular" | "views">("latest")
  const [loading, setLoading] = useState({
    popular: false,
    latest: false
  })

  // 인기 게시글 불러오기
  useEffect(() => {
    const fetchPopularPosts = async () => {
      setLoading(prev => ({ ...prev, popular: true }))
      try {
        const data = await communityService.getPopularPosts(3);
        setPopularPosts(data.posts || []);
      } catch (error) {
        console.error("인기 게시글 로딩 오류:", error);
      } finally {
        setLoading(prev => ({ ...prev, popular: false }))
      }
    };

    fetchPopularPosts();
  }, []);

  // 최신 게시글 불러오기
  useEffect(() => {
    const fetchLatestPosts = async () => {
      setLoading(prev => ({ ...prev, latest: true }))
      try {
        const data = await communityService.getPosts({ sort: sortOrder, limit: 5 });
        setLatestPosts(data.posts || []);
      } catch (error) {
        console.error("최신 게시글 로딩 오류:", error);
      } finally {
        setLoading(prev => ({ ...prev, latest: false }))
      }
    };

    fetchLatestPosts();
  }, [sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/community/search?q=${encodeURIComponent(searchTerm)}`)
    }
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as "latest" | "popular" | "views");
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
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">커뮤니티</h1>
        <Link href="/community/write">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">글쓰기</button>
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">인기 게시글</h2>
        </div>
        <div className="divide-y">
          {loading.popular ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : popularPosts.length > 0 ? (
            popularPosts.map((post) => (
              <div key={post.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold text-lg">
                    <Link href={`/community/posts/${post.id}`} className="text-blue-600 hover:underline">
                      {post.title}
                    </Link>
                  </h3>
                  <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-2">
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
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">인기 게시글이 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">최신 게시글</h2>
          <div className="flex space-x-2">
            <select 
              className="border rounded px-2 py-1 text-sm"
              value={sortOrder}
              onChange={handleSortChange}
            >
              <option value="latest">최신순</option>
              <option value="popular">추천순</option>
              <option value="views">조회순</option>
            </select>
            <form onSubmit={handleSearch} className="flex">
              <input 
                type="text" 
                placeholder="검색" 
                className="border rounded-l px-2 py-1 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                type="submit" 
                className="bg-gray-200 px-2 py-1 rounded-r text-sm"
              >
                검색
              </button>
            </form>
          </div>
        </div>
        <div className="divide-y">
          {loading.latest ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : latestPosts.length > 0 ? (
            latestPosts.map((post) => (
              <div key={post.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold text-lg">
                    <Link href={`/community/posts/${post.id}`} className="text-blue-600 hover:underline">
                      {post.title}
                    </Link>
                  </h3>
                  <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-2">
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
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">게시글이 없습니다.</p>
            </div>
          )}
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