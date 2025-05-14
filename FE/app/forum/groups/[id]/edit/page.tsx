"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select"
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

export default function EditGroupPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // 카테고리 목록
  const categories = [
    "개발", "연구", "하드웨어", "소프트웨어", "스터디", 
    "프로젝트", "시뮬레이션", "제어", "기타"
  ];
  
  // 데이터 로드
  useEffect(() => {
    const fetchGroup = () => {
      // 실제로는 API 호출
      setTimeout(() => {
        // 샘플 데이터
        setName("RoboDK 개발자 모임");
        setDescription("RoboDK API 개발과 관련된 정보를 공유하고 문제를 함께 해결하는 그룹입니다. 이 그룹에서는 RoboDK 라이브러리 사용 방법, API 활용 사례, 자동화 스크립트 작성 팁 등을 공유합니다.");
        setCategory("개발");
        setPrivacy("public");
        setAvatarUrl("https://api.dicebear.com/7.x/identicon/svg?seed=robodk");
        setIsLoading(false);
      }, 500);
    };
    
    fetchGroup();
  }, [params.id]);
  
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
      
      // 실제로는 API를 호출하여 그룹 정보 업데이트
      console.log({
        id: params.id,
        name,
        description,
        category,
        privacy,
        avatarUrl
      });
      
      // 업데이트 성공 후 그룹 상세 페이지로 이동
      alert("그룹 정보가 수정되었습니다.");
      router.push(`/forum/groups/${params.id}`);
    } catch (error) {
      console.error("그룹 수정 실패:", error);
      alert("그룹 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 그룹 삭제
  const handleDeleteGroup = () => {
    try {
      // 실제로는 API를 호출하여 그룹 삭제
      console.log("그룹 삭제:", params.id);
      alert("그룹이 삭제되었습니다.");
      router.push("/forum/groups");
    } catch (error) {
      console.error("그룹 삭제 실패:", error);
      alert("그룹 삭제에 실패했습니다.");
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center">
        <p>그룹 정보를 불러오는 중...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/forum/groups/${params.id}`}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            그룹으로 돌아가기
          </Link>
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">그룹 관리</h1>
        </div>
        
        <Tabs defaultValue="settings" className="w-full">
          <div className="px-6 pt-4 pb-4 border-b">
            <TabsList>
              <TabsTrigger value="settings">기본 설정</TabsTrigger>
              <TabsTrigger value="members">멤버 관리</TabsTrigger>
              <TabsTrigger value="danger">고급 관리</TabsTrigger>
            </TabsList>
          </div>
          
          {/* 기본 설정 탭 */}
          <TabsContent value="settings" className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 그룹 아바타 */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>{name.substring(0, 2)}</AvatarFallback>
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
              
              {/* 제출 버튼 */}
              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(`/forum/groups/${params.id}`)}
                >
                  취소
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "저장 중..." : "변경사항 저장"}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          {/* 멤버 관리 탭 */}
          <TabsContent value="members" className="p-6">
            <h2 className="text-xl font-semibold mb-4">멤버 관리</h2>
            <p className="text-gray-600 mb-4">
              그룹 멤버를 관리하고 역할을 부여하거나 멤버를 추방할 수 있습니다.
            </p>
            
            <div className="p-8 text-center text-gray-500">
              <p>이 기능은 추후 업데이트됩니다.</p>
            </div>
          </TabsContent>
          
          {/* 고급 관리 탭 */}
          <TabsContent value="danger" className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-600">고급 관리</h2>
            <p className="text-gray-600 mb-6">
              이 탭에서는 그룹을 삭제하거나 소유권을 이전하는 등의 위험한 작업을 수행할 수 있습니다. 신중하게 진행해주세요.
            </p>
            
            <div className="space-y-6">
              {/* 그룹 삭제 */}
              <div className="border border-red-200 rounded-md p-4 bg-red-50">
                <h3 className="text-lg font-medium text-red-800 mb-2">그룹 삭제</h3>
                <p className="text-sm text-red-700 mb-4">
                  그룹을 삭제하면 모든 토픽과 콘텐츠가 영구적으로 삭제되며, 이 작업은 되돌릴 수 없습니다.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  그룹 삭제
                </Button>
              </div>
              
              {/* 소유권 이전 */}
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-2">소유권 이전</h3>
                <p className="text-sm text-gray-600 mb-4">
                  그룹의 소유권을 다른 멤버에게 이전할 수 있습니다. 소유권이 이전되면 현재 계정은 관리자 권한을 유지합니다.
                </p>
                <Button variant="outline">
                  소유권 이전
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말로 이 그룹을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없으며, 그룹의 모든 토픽과 콘텐츠가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGroup} className="bg-red-600 hover:bg-red-700">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 