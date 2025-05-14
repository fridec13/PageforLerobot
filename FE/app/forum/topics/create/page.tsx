"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

export default function CreateTopicPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 추천 태그 목록
  const suggestedTags = ["RoboDK", "ROS2", "OnShape", "오류해결", "제어", "프로그래밍", "하드웨어"];

  // 태그 추가
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
    }
    setTagInput("");
  };

  // 추천 태그 추가
  const addSuggestedTag = (tag: string) => {
    if (!tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
    }
  };

  // 태그 삭제
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 태그 입력 핸들러
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // 실제로는 API를 통해 데이터 저장
      console.log({
        title,
        content,
        tags
      });
      
      // 저장 후 토픽 목록으로 이동
      alert("질문이 등록되었습니다.");
      router.push("/forum/topics");
    } catch (error) {
      console.error("질문 등록 실패:", error);
      alert("질문 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 뒤로 가기 */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/forum/topics">
            <ChevronLeft className="h-4 w-4 mr-1" />
            토픽 목록으로 돌아가기
          </Link>
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">새 질문 등록</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* 제목 입력 */}
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                placeholder="명확하고 구체적인 질문 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            {/* 내용 입력 */}
            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                placeholder="질문 내용을 자세히 작성해주세요. 코드나 오류 메시지가 있다면 함께 공유해주세요."
                className="min-h-[200px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            
            {/* 태그 입력 */}
            <div className="space-y-2">
              <Label htmlFor="tags">태그 (최대 5개)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} className="bg-blue-100 text-blue-800 flex items-center">
                    {tag}
                    <button 
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 rounded-full hover:bg-blue-200 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                id="tags"
                placeholder="태그를 입력하고 Enter 또는 콤마(,)로 추가하세요"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                disabled={tags.length >= 5}
              />
            </div>
            
            {/* 추천 태그 */}
            {tags.length < 5 && (
              <div className="space-y-2">
                <Label>추천 태그</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags
                    .filter(tag => !tags.includes(tag))
                    .map(tag => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                        onClick={() => addSuggestedTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
            
            {/* 작성 가이드라인 */}
            <div className="bg-blue-50 p-4 rounded-md text-sm">
              <h3 className="font-medium text-blue-800 mb-2">질문 작성 가이드라인</h3>
              <ul className="list-disc pl-5 text-blue-700 space-y-1">
                <li>명확하고 구체적인 제목으로 작성해주세요.</li>
                <li>문제 상황, 시도한 방법, 오류 메시지 등을 상세히 기록해주세요.</li>
                <li>관련 코드가 있다면 함께 공유해주세요.</li>
                <li>적절한 태그를 사용하면 더 빠른 답변을 받을 수 있습니다.</li>
              </ul>
            </div>
            
            {/* 제출 버튼 */}
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/forum/topics")}
              >
                취소
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "등록 중..." : "질문 등록"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 