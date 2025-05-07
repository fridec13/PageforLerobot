"use client"

import { useState } from "react"
import Link from "next/link"
import { User, Key, MessageSquare, Award, History } from "lucide-react"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("info")

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">내 프로필</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row items-center md:items-start gap-6 border-b">
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-16 w-16 text-gray-400" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold">로봇연구자</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">기여자</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                위키 편집자
              </span>
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                포럼 활동가
              </span>
            </div>
            <p className="text-gray-600 mt-2">가입일: 2023년 5월 15일</p>
            <p className="text-gray-600">기여 횟수: 42회</p>
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
                    <input type="text" className="w-full border rounded-md px-3 py-2" defaultValue="로봇연구자" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                    <input
                      type="email"
                      className="w-full border rounded-md px-3 py-2"
                      defaultValue="robot@example.com"
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
                    <input type="password" className="w-full border rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
                    <input type="password" className="w-full border rounded-md px-3 py-2" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  칭호 관리
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="border rounded-md p-3 text-center cursor-pointer bg-blue-50 border-blue-300">
                    <span className="block font-medium">기여자</span>
                    <span className="text-xs text-gray-500">활성</span>
                  </div>
                  <div className="border rounded-md p-3 text-center cursor-pointer">
                    <span className="block font-medium">위키 편집자</span>
                    <span className="text-xs text-gray-500">비활성</span>
                  </div>
                  <div className="border rounded-md p-3 text-center cursor-pointer">
                    <span className="block font-medium">포럼 활동가</span>
                    <span className="text-xs text-gray-500">비활성</span>
                  </div>
                  <div className="border rounded-md p-3 text-center cursor-pointer opacity-50">
                    <span className="block font-medium">Sapiens</span>
                    <span className="text-xs text-gray-500">미획득</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">저장하기</button>
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
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="border rounded-md p-4">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">RoboDK 설치 가이드 수정</h4>
                      <span className="text-sm text-gray-500">3일 전</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Linux 설치 과정에 누락된 의존성 패키지 정보를 추가했습니다.
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">문서 수정</span>
                      <Link href={`/docs/commit/${item}`} className="text-sm text-blue-600 hover:underline">
                        변경 내용 보기
                      </Link>
                    </div>
                  </div>
                ))}
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
                {[1, 2, 3].map((item) => (
                  <div key={item} className="border rounded-md p-4">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">관리자로부터의 메시지</h4>
                      <span className="text-sm text-gray-500">1일 전</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      RoboDK 문서에 대한 귀하의 기여에 감사드립니다. 추가적인 내용이 있으면 계속해서 기여해 주세요.
                    </p>
                    <div className="flex justify-end">
                      <button className="text-sm text-blue-600 hover:underline">답장하기</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 