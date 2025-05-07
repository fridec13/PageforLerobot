"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Bell, Menu, LogOut } from "lucide-react"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"
import React from "react"
import { useAuthStore } from "@/lib/store/authStore"

interface PathItem {
  label: string
  path: string
}

export function Header() {
  const pathname = usePathname() || ""
  const { user, isAuthenticated, logout } = useAuthStore();
  
  const currentPath = useMemo(() => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const pathItems: PathItem[] = []
    
    if (pathSegments.length > 0) {
      const mainSegment = pathSegments[0].toUpperCase()
      pathItems.push({ label: mainSegment, path: `/${pathSegments[0]}` })
      
      if (pathSegments.length > 1) {
        pathItems.push({ 
          label: pathSegments[1], 
          path: `/${pathSegments[0]}/${pathSegments[1]}` 
        })
      }
    }
    
    return pathItems
  }, [pathname])

  const handleLogout = () => {
    logout();
  };

  // 사용자 이름에서 이니셜 생성
  const getInitials = (name: string) => {
    if (!name) return "사용자";
    const names = name.split(" ");
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-card border-b py-3 px-6 flex justify-between items-center sticky top-0 z-10 shadow-sm">
      <div className="flex items-center space-x-2">
        <Link href="/" className="font-bold text-xl flex items-center hover:opacity-90 transition-opacity">
          <div className="bg-blue-500 text-white rounded-lg px-2 py-1 mr-2">R</div>
          <span className="text-foreground">Robo<span className="text-blue-500">SSAFY</span>ens</span>
        </Link>
        {currentPath.length > 0 && (
          <Breadcrumb className="ml-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">       HOME</BreadcrumbLink>
              </BreadcrumbItem>

              {currentPath.map((item, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {index === currentPath.length - 1 ? (
                      <span className="font-medium">{item.label}</span>
                    ) : (
                      <BreadcrumbLink href={item.path}>{item.label}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {isAuthenticated ? (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 bg-destructive text-white text-xs h-4 w-4 flex items-center justify-center p-0">
                    3
                  </Badge>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="end">
                <div className="font-medium px-3 py-2 border-b">알림</div>
                <div className="divide-y">
                  <div className="text-sm p-3 hover:bg-accent rounded cursor-pointer">
                    관리자가 귀하의 문서 변경 요청을 승인했습니다.
                  </div>
                  <div className="text-sm p-3 hover:bg-accent rounded cursor-pointer">
                    새로운 댓글이 작성되었습니다.
                  </div>
                  <div className="text-sm p-3 hover:bg-accent rounded cursor-pointer">
                    칭호 '기여자'를 획득하셨습니다. 축하합니다!
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user?.profileImage} />
                    <AvatarFallback className="bg-blue-500 text-white text-xs">
                      {user?.username ? getInitials(user.username) : "사용자"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{user?.username || "사용자"}</span>
                  {user?.title && (
                    <Badge variant="outline" className="ml-1 text-xs">
                      {user.title}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0" align="end">
                <div className="py-1">
                  <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-accent">
                    프로필
                  </Link>
                  <Link href="/profile/contributions" className="block px-4 py-2 text-sm hover:bg-accent">
                    내 기여
                  </Link>
                  <Link href="/profile/messages" className="block px-4 py-2 text-sm hover:bg-accent">
                    메시지
                  </Link>
                  <Separator />
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    로그아웃
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                로그인
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600">
                회원가입
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
} 