"use client"

import Link from "next/link"

export default function RoboconPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">ROBOCON</h1>
      <p className="text-gray-600 mb-8">
        로봇 시뮬레이션 및 제어를 위한 도구들을 제공합니다. 3D 모델을 확인하고 로봇을 원격으로 제어해보세요.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          href="/robocon/offsetsim"
          className="bg-white shadow-md hover:shadow-lg rounded-lg p-6 transition-shadow"
        >
          <h2 className="text-2xl font-bold mb-2">Offset 시뮬레이션</h2>
          <p className="text-gray-600 mb-4">
            로봇 3D 모델을 확인하고 관절을 조작하여 오프셋 값 변화를 실시간으로 확인합니다.
          </p>
          <div className="flex justify-end">
            <span className="text-blue-600">시작하기 →</span>
          </div>
        </Link>
        
        <Link 
          href="/robocon/connect"
          className="bg-white shadow-md hover:shadow-lg rounded-lg p-6 transition-shadow"
        >
          <h2 className="text-2xl font-bold mb-2">로봇 연결</h2>
          <p className="text-gray-600 mb-4">
            실제 로봇과 연결하고 리더/팔로워를 설정합니다. 일련번호 관리와 상태 확인이 가능합니다.
          </p>
          <div className="flex justify-end">
            <span className="text-blue-600">시작하기 →</span>
          </div>
        </Link>
        
        <Link 
          href="/robocon/camera"
          className="bg-white shadow-md hover:shadow-lg rounded-lg p-6 transition-shadow"
        >
          <h2 className="text-2xl font-bold mb-2">카메라</h2>
          <p className="text-gray-600 mb-4">
            연결된 웹캠의 상태를 확인하고 이미지를 캡처합니다.
          </p>
          <div className="flex justify-end">
            <span className="text-blue-600">시작하기 →</span>
          </div>
        </Link>
        
        <Link 
          href="/robocon/model"
          className="bg-white shadow-md hover:shadow-lg rounded-lg p-6 transition-shadow"
        >
          <h2 className="text-2xl font-bold mb-2">AI 모델</h2>
          <p className="text-gray-600 mb-4">
            AI 모델을 선택하고 Hugging Face 저장소와 연결하여 로봇 자동 제어를 구성합니다.
          </p>
          <div className="flex justify-end">
            <span className="text-blue-600">시작하기 →</span>
          </div>
        </Link>
      </div>
    </div>
  )
} 