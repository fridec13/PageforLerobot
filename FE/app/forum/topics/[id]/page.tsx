"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Heart, Flag, Edit, Trash2, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function TopicDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newAnswer, setNewAnswer] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(true); // 실제로는 인증 상태를 확인해야 함

  // 실제로는 API에서 데이터를 가져와야 하지만, 지금은 더미 데이터를 사용
  const topic = {
    id: params.id,
    title: "RoboDK에서 로봇 경로 생성 시 오류가 발생합니다.",
    content: `RoboDK 최신 버전(5.4)에서 로봇 경로를 생성하려고 할 때 "Invalid target" 오류가 발생합니다.

제가 시도한 방법:
1. 모든 좌표가 올바른지 확인했습니다.
2. 로봇 모델을 다시 로드했습니다.
3. 이전 버전으로 다시 시도했으나 동일한 문제가 발생합니다.

누구든지 이 문제를 해결해본 경험이 있으시면 도움 부탁드립니다.`,
    author: {
      name: "로봇매니아",
      image: "https://api.dicebear.com/7.x/lorelei/svg?seed=user1",
      title: "로봇 애호가"
    },
    createdAt: "2023-08-15T10:30:00Z",
    views: 42,
    likes: 5,
    tags: ["RoboDK", "오류해결"],
    isAuthor: true // 실제로는 현재 사용자와 작성자를 비교해야 함
  };

  // 답변 목록 (더미 데이터)
  const answers = [
    {
      id: "answer_1",
      content: "이 오류는 주로 타겟 포인트가 로봇의 작업 영역을 벗어날 때 발생합니다. 로봇의 리치(reach)를 확인해보세요. 또한, 로봇 베이스의 위치가 올바르게 설정되어 있는지 확인하세요.",
      author: {
        name: "RoboDK전문가",
        image: "https://api.dicebear.com/7.x/lorelei/svg?seed=expert1",
        title: "RoboSSAFYens"
      },
      createdAt: "2023-08-15T11:15:00Z",
      likes: 8,
      isAccepted: true,
      isAuthor: false
    },
    {
      id: "answer_2",
      content: "저도 비슷한 문제를 겪었는데, 로봇 설정에서 'Advanced' 탭으로 가서 'Joint limits' 옵션을 확인해보세요. 가끔 조인트 제한이 너무 엄격하게 설정되어 있으면 이런 오류가 발생할 수 있습니다.",
      author: {
        name: "테크노진",
        image: "https://api.dicebear.com/7.x/lorelei/svg?seed=user2",
        title: "로봇 전문가"
      },
      createdAt: "2023-08-15T14:22:00Z",
      likes: 3,
      isAccepted: false,
      isAuthor: false
    }
  ];

  // 답변 제출 핸들러
  const handleSubmitAnswer = () => {
    if (!newAnswer.trim()) return;
    
    // 실제로는 API를 통해 답변 저장
    console.log("답변 제출:", newAnswer);
    alert("답변이 등록되었습니다.");
    setNewAnswer("");
  };

  // 질문 삭제 핸들러
  const handleDeleteTopic = () => {
    // 실제로는 API를 통해 질문 삭제
    console.log("질문 삭제:", params.id);
    alert("질문이 삭제되었습니다.");
    router.push("/forum/topics");
  };

  // 포맷된 날짜 반환
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 뒤로 가기 */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/forum/topics">
            <ChevronLeft className="h-4 w-4 mr-1" />
            모든 토픽으로 돌아가기
          </Link>
        </Button>
      </div>

      {/* 질문 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between mb-4">
            <h1 className="text-2xl font-bold">{topic.title}</h1>
            <div className="flex space-x-1">
              {topic.isAuthor && (
                <>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/forum/topics/${topic.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* 질문 메타데이터 */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={topic.author.image} />
                <AvatarFallback>{topic.author.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <span className="font-medium">{topic.author.name}</span>
                {topic.author.title && (
                  <Badge className="ml-2 bg-blue-100 text-blue-800">{topic.author.title}</Badge>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(topic.createdAt)} • 조회 {topic.views}
            </div>
          </div>

          {/* 질문 내용 */}
          <div className="prose max-w-none mb-4 whitespace-pre-line">
            {topic.content}
          </div>

          {/* 태그 및 액션 */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex flex-wrap gap-2">
              {topic.tags.map(tag => (
                <Badge key={tag} variant="outline" className="bg-gray-100">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-1" />
                좋아요 ({topic.likes})
              </Button>
              <Button variant="outline" size="sm">
                <Flag className="h-4 w-4 mr-1" />
                신고
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 답변 섹션 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            답변 {answers.length}개
          </h2>
        </div>

        {/* 답변 목록 */}
        <div className="divide-y">
          {answers.map(answer => (
            <div key={answer.id} className={`p-6 ${answer.isAccepted ? 'bg-green-50' : ''}`}>
              <div className="flex justify-between mb-3">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={answer.author.image} />
                    <AvatarFallback>{answer.author.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium">{answer.author.name}</span>
                    {answer.author.title && (
                      <Badge className="ml-2 bg-blue-100 text-blue-800">{answer.author.title}</Badge>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(answer.createdAt)}
                </div>
              </div>

              {/* 답변 내용 */}
              <div className="prose max-w-none mb-4">
                {answer.content}
              </div>

              {/* 답변 액션 */}
              <div className="flex justify-between items-center mt-4">
                {answer.isAccepted && (
                  <Badge className="bg-green-100 text-green-800">채택된 답변</Badge>
                )}
                <div className="flex space-x-2 ml-auto">
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4 mr-1" />
                    좋아요 ({answer.likes})
                  </Button>
                  {topic.isAuthor && !answer.isAccepted && (
                    <Button variant="outline" size="sm" className="text-green-600">
                      채택
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 답변 작성 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">답변 작성</h2>
        </div>
        <div className="p-6">
          {isLoggedIn ? (
            <>
              <Textarea
                placeholder="답변을 작성하세요..."
                className="min-h-[120px] mb-4"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
              />
              <div className="flex justify-end">
                <Button onClick={handleSubmitAnswer}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  답변 등록
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="mb-4">답변을 작성하려면 로그인이 필요합니다.</p>
              <Button asChild>
                <Link href="/auth/login">로그인</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말로 이 질문을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없으며, 모든 답변도 함께 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTopic} className="bg-red-600 hover:bg-red-700">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 