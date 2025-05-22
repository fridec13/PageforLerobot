"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Key, Award } from "lucide-react"
import userService, { UserProfile, PasswordChangeRequest, ProfileUpdateRequest } from "@/lib/services/userService"
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useAuthStore, useAuth } from "@/lib/auth"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [availableTitles, setAvailableTitles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [updateForm, setUpdateForm] = useState<ProfileUpdateRequest>({
    name: '',
    email: '',
    title: ''
  })
  const [passwordForm, setPasswordForm] = useState<PasswordChangeRequest>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // 프로필 데이터 로드
  useEffect(() => {
    // 인증되지 않은 경우 또는 로딩 중인 경우에는 프로필을 로드하지 않음
    if (authLoading || !isAuthenticated || !user?.id) {
      return;
    }
    
    // 프로필 정보 로드
    const loadProfile = async () => {
      try {
        setLoading(true);
        console.log('프로필 정보 로드 시작:', user.id);
        const userData = await userService.getMyProfile();
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
      try {
        const titles = await userService.getTitles();
        setAvailableTitles(titles);
      } catch (error) {
        console.error('칭호 목록 로딩 오류:', error);
      }
    };

    loadProfile();
    loadTitles();
  }, [user, isAuthenticated, authLoading]);

  // 조건부 반환은 모든 Hook 선언 후에 배치해야 함
  if (authLoading) {
    return <div className="flex justify-center items-center h-64">로그인 정보 확인 중...</div>
  }
  
  // 로그인하지 않은 경우 로그인 유도 UI 표시
  if (!isAuthenticated) {
    console.log('인증되지 않은 사용자 - 로그인 유도 UI 표시');
    return (
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">내 프로필</h1>
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-6">
            프로필 정보를 보려면 로그인이 필요합니다.
          </p>
          <Link href="/auth/login?returnUrl=/profile" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded">
            로그인하기
          </Link>
        </div>
      </div>
    )
  }

  // 프로필 업데이트 핸들러
  const handleProfileUpdate = async () => {
    if (!isAuthenticated || !user?.id) return
    
    try {
      const updatedProfile = await userService.updateProfile(updateForm)
      setProfile(updatedProfile)
      alert('프로필이 성공적으로 업데이트되었습니다.')
    } catch (error) {
      console.error('프로필 업데이트 오류:', error)
      alert('프로필 업데이트 중 오류가 발생했습니다.')
    }
  }

  // 비밀번호 변경 핸들러
  const handlePasswordChange = async () => {
    if (!isAuthenticated || !user?.id) return
    
    try {
      await userService.changePassword(passwordForm)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      alert('비밀번호가 성공적으로 변경되었습니다.')
    } catch (error) {
      console.error('비밀번호 변경 오류:', error)
      alert('비밀번호 변경 중 오류가 발생했습니다.')
    }
  }

  // 칭호 변경 핸들러
  const handleTitleChange = async (title: string) => {
    if (!isAuthenticated || !user?.id) return
    
    try {
      await userService.setActiveTitle(title)
      setProfile(prev => prev ? { ...prev, title } : null)
      alert('칭호가 성공적으로 변경되었습니다.')
    } catch (error) {
      console.error('칭호 변경 오류:', error)
      alert('칭호 변경 중 오류가 발생했습니다.')
    }
  }

  if (loading || !profile) {
    return <div className="flex justify-center items-center h-64">프로필 로딩 중...</div>
  }

  return (
    <div className="max-w-6xl mx-auto">
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
                  {typeof badge === 'string' ? badge : badge.name}
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
          <div className="flex-1 py-3 text-center font-medium text-blue-600 border-b-2 border-blue-600">
            기본 정보
          </div>
          <Link
            href="/profile/contributions"
            className="flex-1 py-3 text-center font-medium text-gray-500 hover:text-gray-700"
          >
            기여 내역
          </Link>
          <Link
            href="/profile/messages"
            className="flex-1 py-3 text-center font-medium text-gray-500 hover:text-gray-700"
          >
            메시지
          </Link>
        </div>

        <div className="p-6">
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
        </div>
      </div>
    </div>
  )
}