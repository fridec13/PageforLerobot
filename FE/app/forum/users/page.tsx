"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import forumService, { ForumUser } from "@/lib/services/forumService"

export default function ForumUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<ForumUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("contribution");
  const currentPage = Number(searchParams.get("page") || "1");
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await forumService.getUsers({
          page: currentPage,
          limit: 10,
          sort: sortBy
        });
        setUsers(response.users || []);
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error("사용자 목록 로딩 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 검색 쿼리가 backend에 구현되어 있다면 search 파라미터를 넘겨서 API를 호출해야 합니다
    if (searchTerm.trim()) {
      router.push(`/forum/users?page=1&search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortBy(value);
    router.push(`/forum/users?page=1&sort=${value}`);
  };

  // 칭호 결정 함수
  const getUserTitle = (user: ForumUser) => {
    // 포인트 계산 (게시글 + 댓글 * 2)
    const points = user.postCount + user.commentCount * 2;
    
    if (points >= 3000) return "로봇 전문가";
    if (points >= 2000) return "로봇 연구자";
    if (points >= 500) return "로봇 애호가";
    return "새싹";
  };

  const getBadges = (user: ForumUser) => {
    const badges = user.badges.map(badge => badge.name);
    return badges.length > 0 ? badges : ["새 사용자"];
  };

  // 포인트 계산 함수
  const calculatePoints = (user: ForumUser) => {
    return user.postCount * 5 + user.commentCount * 10;
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/forum/users?${params.toString()}`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">활동 사용자</h1>
        <div className="flex flex-col md:flex-row gap-2">
          <select 
            className="border rounded p-2 text-sm"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="contribution">포인트 순</option>
            <option value="posts">글 작성 순</option>
            <option value="comments">답변 순</option>
            <option value="joined">가입일 순</option>
          </select>
          <form onSubmit={handleSearch} className="flex">
            <input 
              type="text" 
              placeholder="사용자 검색" 
              className="border rounded-l p-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-gray-200 px-3 py-2 rounded-r text-sm hover:bg-gray-300"
            >
              검색
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">포인트 리더보드</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">사용자 목록을 불러오는 중...</p>
          </div>
        ) : users.length > 0 ? (
          <div className="divide-y">
            {users.map((user) => (
              <div key={user.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={user.image} alt={user.username} />
                    <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center">
                        <Link href={`/forum/users/${user.username}`}>
                          <h3 className="font-semibold text-lg hover:text-blue-600">{user.username}</h3>
                        </Link>
                        <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                          {getUserTitle(user)}
                        </Badge>
                      </div>
                      <span className="text-lg font-bold text-blue-600">{calculatePoints(user)} 포인트</span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600 mb-2">
                      <span>질문: {user.postCount}</span>
                      <span>답변: {user.commentCount}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {getBadges(user).map((badge, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-100">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">사용자가 없습니다.</p>
          </div>
        )}
        
        {users.length > 0 && totalPages > 1 && (
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