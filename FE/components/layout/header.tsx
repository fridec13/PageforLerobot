"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Bell, Menu, LogOut } from "lucide-react"
import { useMemo, useEffect } from "react"
import { useAuthStore } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"
import React from "react"
import { useAuth } from "@/lib/auth"
import { SearchDialog } from "@/components/search/search-dialog"
import { NotificationDropdown } from "@/components/notifications/notification-dropdown"
import { useNotificationStore, requestNotificationPermission } from "@/lib/store/notificationStore"

interface PathItem {
  label: string
  path: string
}

interface HeaderProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export function Header({ isMobileOpen, setIsMobileOpen }: HeaderProps) {
  const pathname = usePathname() || ""
  const { user, isAuthenticated } = useAuth();
  const logout = useAuthStore(state => state.logout);
  const { addNotification } = useNotificationStore();
  
  // 컴포넌트 마운트 시 알림 권한 요청
  useEffect(() => {
    if (isAuthenticated) {
      requestNotificationPermission();
    }
  }, [isAuthenticated]);
  
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
    window.location.href = '/';
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
    <header className="bg-card border-b py-3 px-4 md:px-6 flex justify-between items-center sticky top-0 z-20 shadow-sm">
      <div className="flex items-center space-x-1 md:space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="mr-1 lg:hidden"
          onClick={() => setIsMobileOpen(true)}
          aria-label="메뉴 열기"
        >
          <Menu className="h-5 w-5" />
        </Button>
      
        <Link href="/" className="font-bold text-xl flex items-center hover:opacity-90 transition-opacity">
          <div className="bg-blue-500 text-white rounded-lg px-2 py-1 mr-1 sm:mr-2">R</div>
          <span className="text-foreground hidden xs:inline">Robo<span className="text-blue-500">SSAFY</span>ens</span>
        </Link>
        
        {currentPath.length > 0 && (
          <Breadcrumb className="ml-1 md:ml-4 hidden sm:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">HOME</BreadcrumbLink>
              </BreadcrumbItem>

              {currentPath.map((item, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {index === currentPath.length - 1 ? (
                      <span className="font-medium truncate max-w-[100px] md:max-w-none">{item.label}</span>
                    ) : (
                      <BreadcrumbLink href={item.path} className="truncate max-w-[80px] md:max-w-none">
                        {item.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
      
      <div className="flex items-center space-x-1 md:space-x-2">
        {/* 검색 다이얼로그 */}
        <SearchDialog />
        
        {isAuthenticated ? (
          <>
            {/* 알림 드롭다운 */}
            <NotificationDropdown />
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user?.image || undefined} />
                    <AvatarFallback className="bg-blue-500 text-white text-xs">
                      {user?.name ? getInitials(user.name) : "사용자"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{user?.name || "사용자"}</span>
                  {user?.title && (
                    <Badge variant="outline" className="ml-1 text-xs hidden sm:inline-flex">
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
          <div className="flex items-center gap-1 md:gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-xs md:text-sm">
                로그인
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600 text-xs md:text-sm">
                회원가입
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
} 