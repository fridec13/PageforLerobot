"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FileText, MessageSquare, Users, Cpu, ArrowRight, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto py-8 fade-in">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">Robo<span className="text-blue-500">SSAFY</span>ens</h1>
        <p className="text-2xl text-muted-foreground mb-6">우리가 함께 만들어가는 로봇 지식</p>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto"></div>
      </div>

      <Card className="mb-10 shadow-sm border-t-4 border-t-blue-500">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">사이트 사용 안내</CardTitle>
          <CardDescription>RoboSSAFYens의 다양한 기능을 활용하여 로봇 지식을 공유하고 배워보세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative group rounded-lg border bg-card p-4 hover:shadow-md transition-all">
              <div className="absolute -top-3 -right-2">
                <Badge className="bg-blue-500 text-white font-medium px-2 text-xs">인기</Badge>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <BookOpen className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-medium">위키 (WIKI)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                로봇 관련 지식을 함께 만들어가는 공간입니다. 누구나 내용을 수정하고 기여할 수 있습니다.
              </p>
              <div className="mt-3">
                <Link href="/wiki" className="text-blue-500 text-sm flex items-center group-hover:underline">
                  바로가기 <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            
            <div className="relative group rounded-lg border bg-card p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-medium">기술 문서 (DOCS)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                roboDK, onshape, ROS2 등 로봇 관련 기술 문서를 제공합니다. 변경 사항을 제안할 수 있습니다.
              </p>
              <div className="mt-3">
                <Link href="/docs" className="text-primary text-sm flex items-center group-hover:underline">
                  바로가기 <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            
            <div className="relative group rounded-lg border bg-card p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-medium">포럼 (FORUM)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Q&A 형태로 질문하고 답변을 받을 수 있는 공간입니다. 활동을 통해 포인트를 얻을 수 있습니다.
              </p>
              <div className="mt-3">
                <Link href="/forum" className="text-primary text-sm flex items-center group-hover:underline">
                  바로가기 <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            
            <div className="relative group rounded-lg border bg-card p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-medium">커뮤니티 (COMMUNITY)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                자유롭게 소통할 수 있는 게시판입니다. 추천을 많이 받은 게시글은 인기 게시글로 선정됩니다.
              </p>
              <div className="mt-3">
                <Link href="/community" className="text-primary text-sm flex items-center group-hover:underline">
                  바로가기 <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            
            <div className="relative group rounded-lg border bg-card p-4 hover:shadow-md transition-all">
              <div className="absolute -top-3 -right-2">
                <Badge className="bg-red-500 text-white font-medium px-2 text-xs">신규</Badge>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                  <Cpu className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-medium">로보콘 (ROBOCON)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                3D 모델을 통해 로봇을 시뮬레이션하고 제어할 수 있는 공간입니다.
              </p>
              <div className="mt-3">
                <Link href="/robocon" className="text-primary text-sm flex items-center group-hover:underline">
                  바로가기 <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-blue-500">시작하기</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="transition-all duration-200 hover:translate-x-1">
                <Link href="/wiki" className="text-foreground hover:text-blue-500 flex items-center">
                  <ArrowRight className="mr-2 h-4 w-4 text-blue-500" />
                  <span className="text-sm">위키 둘러보기</span>
                </Link>
              </li>
              <li className="transition-all duration-200 hover:translate-x-1">
                <Link href="/docs/robodk" className="text-foreground hover:text-blue-500 flex items-center">
                  <ArrowRight className="mr-2 h-4 w-4 text-blue-500" />
                  <span className="text-sm">roboDK 문서 확인하기</span>
                </Link>
              </li>
              <li className="transition-all duration-200 hover:translate-x-1">
                <Link href="/forum/topics" className="text-foreground hover:text-blue-500 flex items-center">
                  <ArrowRight className="mr-2 h-4 w-4 text-blue-500" />
                  <span className="text-sm">포럼 질문하기</span>
                </Link>
              </li>
              <li className="transition-all duration-200 hover:translate-x-1">
                <Link href="/robocon/offsetsim" className="text-foreground hover:text-blue-500 flex items-center">
                  <ArrowRight className="mr-2 h-4 w-4 text-blue-500" />
                  <span className="text-sm">로봇 시뮬레이션 해보기</span>
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-blue-500">기여하기</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              RoboSSAFYens는 사용자들의 기여로 성장합니다. 문서 작성, 토론 참여, 질문 답변 등 다양한 방법으로 기여할 수
              있습니다.
            </p>
            <p className="text-sm text-muted-foreground">
              기여도에 따라 다양한 칭호를 획득할 수 있으며, 특별한 인증을 통해 <span className="font-semibold text-blue-500">Sapiens</span> 칭호를 얻을 수 있습니다.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="default" className="w-full bg-blue-500 hover:bg-blue-600" asChild>
              <Link href="/auth/register">가입하고 시작하기</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}