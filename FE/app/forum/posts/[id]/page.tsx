"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ThumbsUp, MessageSquare, Eye, Share2 } from "lucide-react"
import forumService, { ForumPost, ForumComment } from "@/lib/services/forumService"

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [post, setPost] = useState<ForumPost | null>(null)
  const [comments, setComments] = useState<ForumComment[]>([])
  const [commentText, setCommentText] = useState("")
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // 게시글 상세 정보 가져오기
        const postData = await forumService.getPostDetail(Number(params.id))
        setPost(postData)

        // 댓글 목록 가져오기
        const commentsData = await forumService.getComments(Number(params.id))
        setComments(commentsData.comments || [])
      } catch (error) {
        console.error("게시글 로딩 오류:", error)
        // 오류 발생 시 목록 페이지로 이동
        router.push("/forum/topics")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, router])

  // 댓글 등록 처리
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!commentText.trim()) return
    
    setCommentLoading(true)
    try {
      await forumService.createComment(Number(params.id), commentText)
      
      // 댓글 목록 다시 불러오기
      const commentsData = await forumService.getComments(Number(params.id))
      setComments(commentsData.comments || [])
      
      // 입력 필드 초기화
      setCommentText("")
    } catch (error) {
      console.error("댓글 작성 오류:", error)
    } finally {
      setCommentLoading(false)
    }
  }

  // 좋아요 처리
  const handleLike = async () => {
    if (!post) return
    
    setLikeLoading(true)
    try {
      if (post.isLiked) {
        await forumService.unlikePost(post.id)
        
        // 게시글 정보 업데이트
        setPost({
          ...post,
          likeCount: post.likeCount - 1,
          isLiked: false
        })
      } else {
        await forumService.likePost(post.id)
        
        // 게시글 정보 업데이트
        setPost({
          ...post,
          likeCount: post.likeCount + 1,
          isLiked: true
        })
      }
    } catch (error) {
      console.error("좋아요 처리 오류:", error)
    } finally {
      setLikeLoading(false)
    }
  }

  // 댓글 좋아요 처리
  const handleCommentLike = async (commentId: number, isLiked: boolean | undefined) => {
    try {
      if (isLiked) {
        await forumService.unlikeComment(Number(params.id), commentId)
      } else {
        await forumService.likeComment(Number(params.id), commentId)
      }
      
      // 댓글 목록 다시 불러오기
      const commentsData = await forumService.getComments(Number(params.id))
      setComments(commentsData.comments || [])
    } catch (error) {
      console.error("댓글 좋아요 처리 오류:", error)
    }
  }

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">게시글을 불러오는 중...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">게시글을 찾을 수 없습니다</h2>
        <button
          onClick={() => router.push("/forum/topics")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          목록으로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 뒤로 가기 및 게시글 정보 */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:underline mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> 토픽으로 돌아가기
        </button>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
          <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-200 rounded-full mr-2 overflow-hidden">
                {/* 사용자 프로필 이미지 */}
                <div className="h-full w-full bg-blue-300 flex items-center justify-center text-white">
                  {post.author.username[0]}
                </div>
              </div>
              <Link href={`/forum/users/${post.author.username}`}>
                <span className="hover:underline">{post.author.username}</span>
              </Link>
              <span className="mx-2">•</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>{post.viewCount}</span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{post.commentCount}</span>
              </div>
            </div>
          </div>
          
          {/* 게시글 내용 */}
          <div className="border-t border-b py-6 whitespace-pre-wrap">
            {post.content}
          </div>
          
          {/* 태그 표시 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-1 mt-4 flex-wrap">
              {post.tags.map((tag, index) => (
                <span key={index} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* 좋아요 및 공유 버튼 */}
          <div className="flex justify-between items-center py-4">
            <button 
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center px-4 py-2 rounded-full ${post.isLiked ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'} disabled:opacity-50`}
            >
              <ThumbsUp className={`h-5 w-5 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
              <span>{likeLoading ? "처리 중..." : `좋아요 ${post.likeCount}`}</span>
            </button>
            <button className="flex items-center px-4 py-2 rounded-full hover:bg-gray-100">
              <Share2 className="h-5 w-5 mr-1" />
              <span>공유하기</span>
            </button>
          </div>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">댓글 {comments.length}개</h2>
        
        {/* 댓글 작성 폼 */}
        <form onSubmit={handleCommentSubmit} className="mb-6">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full border rounded-lg p-3 mb-2"
            rows={3}
            placeholder="댓글을 작성하세요..."
            required
            disabled={commentLoading}
          />
          <div className="flex justify-end">
            <button 
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
              disabled={commentLoading}
            >
              {commentLoading ? "작성 중..." : "댓글 작성"}
            </button>
          </div>
        </form>
        
        {/* 댓글 목록 */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="border-b pb-4">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gray-200 rounded-full mr-2 overflow-hidden">
                      {comment.author.image ? (
                        <img src={comment.author.image} alt={comment.author.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-green-300 flex items-center justify-center text-white">
                          {comment.author.username[0]}
                        </div>
                      )}
                    </div>
                    <Link href={`/forum/users/${comment.author.username}`}>
                      <span className="font-semibold hover:underline">{comment.author.username}</span>
                    </Link>
                    <span className="mx-2 text-gray-500">•</span>
                    <span className="text-gray-500 text-sm">{formatDate(comment.createdAt)}</span>
                  </div>
                  <button 
                    onClick={() => handleCommentLike(comment.id, comment.isLiked)}
                    className="flex items-center text-gray-500 hover:text-blue-600"
                  >
                    <ThumbsUp className={`h-4 w-4 mr-1 ${comment.isLiked ? 'fill-current text-blue-600' : ''}`} />
                    <span>{comment.likeCount}</span>
                  </button>
                </div>
                <p className="ml-10">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
          )}
        </div>
      </div>
    </div>
  )
} 