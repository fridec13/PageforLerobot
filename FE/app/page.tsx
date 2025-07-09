"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cpu, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // 3초 후 자동으로 offset sim으로 리다이렉트
    const timer = setTimeout(() => {
      router.push('/robocon/offsetsim')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Cpu className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Robot Offset Simulator
          </CardTitle>
          <CardDescription className="text-gray-600">
            3D 로봇 모델을 통한 오프셋 시뮬레이션 도구
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-500">
            3초 후 자동으로 이동됩니다...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse w-1/3"></div>
          </div>
          <div className="pt-4">
            <Button asChild className="w-full bg-blue-500 hover:bg-blue-600">
              <Link href="/robocon/offsetsim" className="flex items-center justify-center">
                지금 시작하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}