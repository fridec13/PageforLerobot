"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ThumbsUp, MessageSquare, Eye, Share2 } from "lucide-react"
import Image from "next/image"
import communityService, { Post, Comment } from "@/lib/services/communityService"

interface CommentWithUser extends Comment {
  author: {
    id: number;
    username: string;
  };
}

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [commentText, setCommentText] = useState("")
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<CommentWithUser[]>([])

  // 게시글 데이터 불러오기
  useEffect(() => {
    const fetchPostData = async () => {
      setLoading(true)
      try {
        const postData = await communityService.getPostById(params.id);
        setPost(postData);

        // 댓글 불러오기
        const commentsData = await communityService.getComments(params.id);
        setComments(commentsData.comments || []);
      } catch (error) {
        console.error("게시글 로딩 오류:", error);
        // 404 페이지로 리다이렉트하거나 에러 처리
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [params.id]);

  const handleLike = async () => {
    if (!post) return;

    try {
      if (liked) {
        await communityService.unlikePost(post.id);
        setPost({
          ...post,
          likeCount: post.likeCount - 1
        });
      } else {
        await communityService.likePost(post.id);
        setPost({
          ...post,
          likeCount: post.likeCount + 1
        });
      }
      setLiked(!liked);
    } catch (error) {
      console.error("게시글 좋아요 오류:", error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post) return;

    setCommentLoading(true);
    try {
      const newComment = await communityService.createComment(post.id, commentText);
      
      // 댓글 목록 다시 불러오기
      const commentsData = await communityService.getComments(params.id);
      setComments(commentsData.comments || []);
      
      setCommentText("");
    } catch (error) {
      console.error("댓글 작성 오류:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">게시글을 불러오는 중...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">게시글을 찾을 수 없습니다</h2>
        <button
          onClick={() => router.push("/community")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          커뮤니티로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 뒤로 가기 및 작성 정보 */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:underline mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> 커뮤니티로 돌아가기
        </button>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
          <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-200 rounded-full mr-2 overflow-hidden">
                <div className="h-full w-full bg-blue-300 flex items-center justify-center text-white">
                  {post.author.username[0]}
                </div>
              </div>
              <span>{post.author.username}</span>
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
          
          {/* 좋아요 및 공유 버튼 */}
          <div className="flex justify-between items-center py-4">
            <button 
              onClick={handleLike}
              className={`flex items-center px-4 py-2 rounded-full ${liked ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              <ThumbsUp className={`h-5 w-5 mr-1 ${liked ? 'fill-current' : ''}`} />
              <span>좋아요 {post.likeCount}</span>
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
                      <div className="h-full w-full bg-green-300 flex items-center justify-center text-white">
                        {comment.author.username[0]}
                      </div>
                    </div>
                    <span className="font-semibold">{comment.author.username}</span>
                    <span className="mx-2 text-gray-500">•</span>
                    <span className="text-gray-500 text-sm">{formatDate(comment.createdAt)}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span>{comment.likeCount}</span>
                  </div>
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