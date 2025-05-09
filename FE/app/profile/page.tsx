"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Key, MessageSquare, Award, History } from "lucide-react"
import userService, { UserProfile, UserContribution, UserMessage, PasswordChangeRequest, ProfileUpdateRequest } from "@/lib/services/userService"
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useAuthStore } from "@/lib/auth"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [activeTab, setActiveTab] = useState("info")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [contributions, setContributions] = useState<UserContribution[]>([])
  const [messages, setMessages] = useState<UserMessage[]>([])
  const [availableTitles, setAvailableTitles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [updateForm, setUpdateForm] = useState<ProfileUpdateRequest>({
    name: '',
    email: '',
    title: ''
  })
  const [passwordForm, setPasswordForm] = useState<PasswordChangeRequest>({
    currentPassword: '',
    newPassword: ''
  })

  // 인증 상태를 체크하고 로그인되지 않았으면 로그인 페이지로 이동
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('인증 실패, 로그인 페이지로 이동:', { isLoading, isAuthenticated });
      router.push('/auth/login?returnUrl=/profile');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // 프로필 정보 로드
    const loadProfile = async () => {
      if (!isAuthenticated || !user?.id) return;
      
      try {
        setLoading(true);
        console.log('프로필 정보 로드 시작:', user.id);
        const userData = await userService.getMyProfile(user.id);
        setProfile(userData);
        setUpdateForm({
          name: userData.name,
          email: userData.email,
          title: userData.title
        });
      } catch (error) {
        console.error('프로필 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    // 사용 가능한 칭호 목록 로드
    const loadTitles = async () => {
      if (!isAuthenticated) return;
      
      try {
        const titles = await userService.getTitles();
        setAvailableTitles(titles);
      } catch (error) {
        console.error('칭호 목록 로딩 오류:', error);
      }
    };

    if (isAuthenticated && user?.id) {
      console.log('인증 확인 완료:', { userId: user.id });
      loadProfile();
      loadTitles();
    }
  }, [isAuthenticated, user]);

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    const loadTabData = async () => {
      if (!isAuthenticated || !user?.id) return

      if (activeTab === "contributions") {
        try {
          const result = await userService.getMyContributions(user.id)
          setContributions(result.items)
        } catch (error) {
          console.error('기여 내역 로딩 오류:', error)
        }
      } else if (activeTab === "messages") {
        try {
          const result = await userService.getMyMessages(user.id)
          setMessages(result.items)
        } catch (error) {
          console.error('메시지 로딩 오류:', error)
        }
      }
    }

    if (isAuthenticated) {
      loadTabData()
    }
  }, [activeTab, isAuthenticated, user])

  // 프로필 업데이트 핸들러
  const handleProfileUpdate = async () => {
    if (!user?.id) return
    
    try {
      const updatedProfile = await userService.updateProfile(user.id, updateForm)
      setProfile(updatedProfile)
      alert('프로필이 성공적으로 업데이트되었습니다.')
    } catch (error) {
      console.error('프로필 업데이트 오류:', error)
      alert('프로필 업데이트 중 오류가 발생했습니다.')
    }
  }

  // 비밀번호 변경 핸들러
  const handlePasswordChange = async () => {
    if (!user?.id) return
    
    try {
      await userService.changePassword(user.id, passwordForm)
      setPasswordForm({ currentPassword: '', newPassword: '' })
      alert('비밀번호가 성공적으로 변경되었습니다.')
    } catch (error) {
      console.error('비밀번호 변경 오류:', error)
      alert('비밀번호 변경 중 오류가 발생했습니다.')
    }
  }

  // 칭호 변경 핸들러
  const handleTitleChange = async (title: string) => {
    if (!user?.id) return
    
    try {
      await userService.setActiveTitle(user.id, title)
      setProfile(prev => prev ? { ...prev, title } : null)
      alert('칭호가 성공적으로 변경되었습니다.')
    } catch (error) {
      console.error('칭호 변경 오류:', error)
      alert('칭호 변경 중 오류가 발생했습니다.')
    }
  }

  // 메시지 읽음 처리
  const handleMarkAsRead = async (messageId: string) => {
    if (!user?.id) return
    
    try {
      await userService.markMessageAsRead(user.id, messageId)
      setMessages(prev => 
        prev.map(msg => msg.id === messageId ? { ...msg, read: true } : msg)
      )
    } catch (error) {
      console.error('메시지 읽음 처리 오류:', error)
    }
  }

  // 로그인 여부 및 데이터 로딩 상태 확인
  if (isLoading || !isAuthenticated) {
    return <div className="flex justify-center items-center h-64">로그인 정보 확인 중...</div>
  }
  
  if (loading || !profile) {
    return <div className="flex justify-center items-center h-64">프로필 로딩 중...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">내 프로필</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row items-center md:items-start gap-6 border-b">
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
            {profile.image ? (
              <img src={profile.image} alt={profile.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="h-16 w-16 text-gray-400" />
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">{profile.title}</span>
              {profile.badges?.map((badge, index) => (
                <span key={index} className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  {badge}
                </span>
              ))}
            </div>
            <p className="text-gray-600 mt-2">
              가입일: {profile.createdAt ? format(new Date(profile.createdAt), 'yyyy년 MM월 dd일', { locale: ko }) : '정보 없음'}
            </p>
            <p className="text-gray-600">기여 횟수: {profile.contribution || 0}회</p>
          </div>
        </div>

        <div className="flex border-b">
          <button
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === "info" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("info")}
          >
            기본 정보
          </button>
          <button
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === "contributions"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("contributions")}
          >
            기여 내역
          </button>
          <button
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === "messages"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("messages")}
          >
            메시지
          </button>
        </div>

        <div className="p-6">
          {activeTab === "info" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  계정 정보
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
                    <input 
                      type="text" 
                      className="w-full border rounded-md px-3 py-2" 
                      value={updateForm.name || ''} 
                      onChange={(e) => setUpdateForm({...updateForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                    <input
                      type="email"
                      className="w-full border rounded-md px-3 py-2"
                      value={updateForm.email || ''}
                      onChange={(e) => setUpdateForm({...updateForm, email: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  비밀번호 변경
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
                    <input 
                      type="password" 
                      className="w-full border rounded-md px-3 py-2" 
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
                    <input 
                      type="password" 
                      className="w-full border rounded-md px-3 py-2" 
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <button 
                    className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                    onClick={handlePasswordChange}
                  >
                    비밀번호 변경
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  칭호 관리
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableTitles.map((title) => (
                    <div 
                      key={title}
                      className={`border rounded-md p-3 text-center cursor-pointer ${
                        profile.title === title ? "bg-blue-50 border-blue-300" : ""
                      }`}
                      onClick={() => handleTitleChange(title)}
                    >
                      <span className="block font-medium">{title}</span>
                      <span className="text-xs text-gray-500">
                        {profile.title === title ? '활성' : '비활성'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={handleProfileUpdate}
                >
                  저장하기
                </button>
              </div>
            </div>
          )}

          {activeTab === "contributions" && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <History className="h-5 w-5 mr-2" />
                최근 기여 내역
              </h3>
              <div className="space-y-4">
                {contributions.length > 0 ? (
                  contributions.map((item) => (
                    <div key={item.id} className="border rounded-md p-4">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">{item.title}</h4>
                        <span className="text-sm text-gray-500">
                          {format(new Date(item.createdAt), 'yyyy년 MM월 dd일', { locale: ko })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.type}에 기여했습니다.
                      </p>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          item.type === 'DOCUMENT' ? 'bg-green-100 text-green-800' :
                          item.type === 'WIKI' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {item.type === 'DOCUMENT' ? '문서 수정' : 
                          item.type === 'WIKI' ? '위키 편집' : '포럼 답변'}
                        </span>
                        <Link 
                          href={`/${item.type.toLowerCase()}/${item.id}`} 
                          className="text-sm text-blue-600 hover:underline"
                        >
                          변경 내용 보기
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    아직 기여 내역이 없습니다. 문서 편집이나 위키 작성으로 기여를 시작해보세요!
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "messages" && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                메시지 수신함
              </h3>
              <div className="space-y-4">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`border rounded-md p-4 ${!message.read ? 'bg-blue-50' : ''}`}
                      onClick={() => !message.read && handleMarkAsRead(message.id)}
                    >
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">{message.senderName}님으로부터의 메시지</h4>
                        <span className="text-sm text-gray-500">
                          {format(new Date(message.createdAt), 'yyyy년 MM월 dd일', { locale: ko })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {message.content}
                      </p>
                      <div className="flex justify-end">
                        <button className="text-sm text-blue-600 hover:underline">답장하기</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    받은 메시지가 없습니다.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 