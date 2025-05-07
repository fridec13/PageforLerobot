"use client"

import Link from "next/link"

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">기술 문서</h1>
      <p className="text-gray-600 mb-4">
        RoboSapiens의 기술 문서 섹션에 오신 것을 환영합니다. 여기서는 다양한 로봇 관련 기술 문서를 찾을 수 있습니다.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">RoboDK</h2>
          <p className="text-gray-600 mb-4">
            로봇 시뮬레이션 및 프로그래밍을 위한 소프트웨어
          </p>
          <Link href="/docs/robodk" className="text-blue-600 hover:underline">
            문서 보기 →
          </Link>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Onshape</h2>
          <p className="text-gray-600 mb-4">
            클라우드 기반 3D CAD 설계 소프트웨어
          </p>
          <Link href="/docs/onshape" className="text-blue-600 hover:underline">
            문서 보기 →
          </Link>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">ROS2</h2>
          <p className="text-gray-600 mb-4">
            로봇 운영 시스템의 새로운 버전
          </p>
          <Link href="/docs/ros2" className="text-blue-600 hover:underline">
            문서 보기 →
          </Link>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">LeRobot</h2>
          <p className="text-gray-600 mb-4">
            교육용 로봇 플랫폼
          </p>
          <Link href="/docs/lerobot" className="text-blue-600 hover:underline">
            문서 보기 →
          </Link>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">변경 요청</h2>
          <p className="text-gray-600 mb-4">
            현재 대기 중인 문서 변경 요청 목록
          </p>
          <Link href="/docs/commit" className="text-blue-600 hover:underline">
            요청 보기 →
          </Link>
        </div>
      </div>
    </div>
  )
} 