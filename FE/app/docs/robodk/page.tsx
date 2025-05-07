"use client"

import Link from "next/link"

export default function RoboDKPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">RoboDK 문서</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">RoboDK 소개</h2>
        <p className="text-gray-600 mb-4">
          RoboDK는 로봇 시뮬레이션 및 프로그래밍을 위한 강력한 소프트웨어입니다. 이 문서에서는 RoboDK의 기본 사용법부터
          고급 기능까지 다룹니다.
        </p>
        <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 mb-4">
          <p className="text-sm text-gray-600">이 문서는 최근 업데이트되었습니다. 마지막 수정: 2023-05-15</p>
        </div>
        <h3 className="text-lg font-semibold mb-2">목차</h3>
        <ul className="list-disc pl-5 space-y-1 mb-6">
          <li>
            <Link href="/docs/robodk/installation" className="text-blue-600 hover:underline">
              RoboDK 설치하기
            </Link>
          </li>
          <li>
            <Link href="/docs/robodk/interface" className="text-blue-600 hover:underline">
              인터페이스 둘러보기
            </Link>
          </li>
          <li>
            <Link href="/docs/robodk/first-program" className="text-blue-600 hover:underline">
              첫 번째 로봇 프로그램 만들기
            </Link>
          </li>
          <li>
            <Link href="/docs/robodk/python-api" className="text-blue-600 hover:underline">
              Python API 사용하기
            </Link>
          </li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">RoboDK 설치하기</h3>
        <p className="text-gray-600 mb-4">
          RoboDK는 Windows, macOS, Linux에서 사용할 수 있습니다. 아래 단계에 따라 설치를 진행하세요.
        </p>
        <ol className="list-decimal pl-5 space-y-1 mb-4">
          <li>RoboDK 공식 웹사이트에서 설치 파일을 다운로드합니다.</li>
          <li>다운로드한 설치 파일을 실행합니다.</li>
          <li>설치 마법사의 지시에 따라 설치를 완료합니다.</li>
        </ol>
        
        <div className="mt-8 flex justify-between">
          <Link href="/docs" className="text-blue-600 hover:underline">
            ← 기술 문서 목록으로
          </Link>
          <Link href="/docs/robodk/installation" className="text-blue-600 hover:underline">
            RoboDK 설치하기 →
          </Link>
        </div>
      </div>
    </div>
  )
} 