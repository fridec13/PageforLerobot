"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select"

export default function CreateGroupPage() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(`https://api.dicebear.com/7.x/identicon/svg?seed=${Math.random()}`);
  
  // 카테고리 목록
  const categories = [
    "개발", "연구", "하드웨어", "소프트웨어", "스터디", 
    "프로젝트", "시뮬레이션", "제어", "기타"
  ];
  
  // 아바타 랜덤 생성
  const generateRandomAvatar = () => {
    setAvatarUrl(`https://api.dicebear.com/7.x/identicon/svg?seed=${Math.random()}`);
  };
  
  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert("그룹 이름을 입력해주세요.");
      return;
    }
    
    if (!description.trim()) {
      alert("그룹 설명을 입력해주세요.");
      return;
    }
    
    if (!category) {
      alert("카테고리를 선택해주세요.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // 실제로는 API를 호출하여 그룹 생성
      console.log({
        name,
        description,
        category,
        privacy,
        avatarUrl
      });
      
      // 그룹 생성 성공 후 그룹 목록 페이지로 이동
      alert("그룹이 생성되었습니다.");
      router.push("/forum/groups");
    } catch (error) {
      console.error("그룹 생성 실패:", error);
      alert("그룹 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/forum/groups">
            <ChevronLeft className="h-4 w-4 mr-1" />
            그룹 목록으로 돌아가기
          </Link>
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">새 그룹 만들기</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* 그룹 아바타 */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>그룹</AvatarFallback>
                </Avatar>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="mt-2" 
                  size="sm"
                  onClick={generateRandomAvatar}
                >
                  이미지 변경
                </Button>
              </div>
              
              <div className="flex-grow space-y-4">
                {/* 그룹 이름 */}
                <div className="space-y-2">
                  <Label htmlFor="name">그룹 이름 *</Label>
                  <Input
                    id="name"
                    placeholder="그룹 이름을 입력하세요"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                {/* 카테고리 */}
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리 *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* 그룹 설명 */}
            <div className="space-y-2">
              <Label htmlFor="description">그룹 설명 *</Label>
              <Textarea
                id="description"
                placeholder="그룹의 목적과 활동 내용을 소개해주세요"
                className="min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            
            {/* 공개 설정 */}
            <div className="space-y-2">
              <Label>공개 설정 *</Label>
              <RadioGroup 
                value={privacy} 
                onValueChange={setPrivacy}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="public" id="public" className="mt-1" />
                  <div>
                    <Label htmlFor="public" className="font-medium">공개 그룹</Label>
                    <p className="text-sm text-gray-500">누구나 그룹을 검색하고 가입할 수 있으며, 모든 콘텐츠를 볼 수 있습니다.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="private" id="private" className="mt-1" />
                  <div>
                    <Label htmlFor="private" className="font-medium">비공개 그룹</Label>
                    <p className="text-sm text-gray-500">초대를 통해서만 가입할 수 있으며, 그룹 콘텐츠는 멤버만 볼 수 있습니다.</p>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            {/* 생성 가이드라인 */}
            <div className="bg-blue-50 p-4 rounded-md text-sm">
              <h3 className="font-medium text-blue-800 mb-2">그룹 생성 가이드라인</h3>
              <ul className="list-disc pl-5 text-blue-700 space-y-1">
                <li>그룹은 로봇 관련 주제를 중심으로 만들어주세요.</li>
                <li>적절한 이름과 설명으로 그룹의 목적을 명확하게 해주세요.</li>
                <li>그룹 규칙을 설정하고 멤버들이 이를 준수하도록 관리해주세요.</li>
                <li>상업적인 목적의 스팸 활동은 금지됩니다.</li>
              </ul>
            </div>
            
            {/* 제출 버튼 */}
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/forum/groups")}
              >
                취소
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "생성 중..." : "그룹 생성"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 