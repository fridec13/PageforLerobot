"use client"


import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cpu, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Home() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Cpu className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            SOARM100 3D 모델 뷰어
          </CardTitle>
          <CardDescription className="text-gray-600">
            SOARM100 로봇 팔 3D 모델 뷰어
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div>
            <Button asChild className="w-full bg-blue-500 hover:bg-blue-600">
              <Link href="/robocon/offsetsim" className="flex items-center justify-center">
                3D 모델 뷰어 시작하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}