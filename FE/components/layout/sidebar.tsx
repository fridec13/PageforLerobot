"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, FileText, MessageSquare, Users, Cpu, ChevronDown, ChevronRight, X } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useSidebar } from "@/lib/contexts/SidebarContext"
import DocsSidebarContent from "@/components/docs/DocsSidebarContent"

interface Submenu {
  name: string
  path: string
}

interface Menu {
  name: string
  path: string
  icon: React.ReactNode
  submenus?: Submenu[]
}

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const pathname = usePathname() || ""
  const [openItems, setOpenItems] = useState<{[key: string]: boolean}>({})
  const { mode } = useSidebar(); // 사이드바 모드 가져오기

  // 경로 변경 시 모바일 사이드바 닫기
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  // 현재 경로에 따라 활성 섹션 설정
  useEffect(() => {
    const activeSection = getActiveSection();
    if (activeSection) {
      // 이전 상태를 모두 지우고 현재 활성 섹션만 열기
      setOpenItems({ [activeSection]: true });
    }
  }, [pathname]);

  const menus: Menu[] = [
    {
      name: "WIKI",
      path: "/wiki",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      name: "DOCS",
      path: "/docs",
      icon: <FileText className="h-5 w-5" />,
      submenus: [
        { name: "roboDK", path: "/docs/robodk" },
        { name: "onshape", path: "/docs/onshape" },
        { name: "ROS2", path: "/docs/ros2" },
        { name: "lerobot", path: "/docs/lerobot" },
      ],
    },
    {
      name: "FORUM",
      path: "/forum",
      icon: <MessageSquare className="h-5 w-5" />,
      submenus: [
        { name: "topics", path: "/forum/topics" },
        { name: "users", path: "/forum/users" },
        { name: "badge", path: "/forum/badge" },
        { name: "groups", path: "/forum/groups" },
      ],
    },
    {
      name: "COMMUNITY",
      path: "/community",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "ROBOCON",
      path: "/robocon",
      icon: <Cpu className="h-5 w-5" />,
      submenus: [
        { name: "offsetSIM", path: "/robocon/offsetsim" },
        { name: "configs", path: "/robocon/configs" },
        { name: "camera", path: "/robocon/camera" },
        { name: "train", path: "/robocon/train" },
      ],
    },
  ]

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/")
  }

  const getActiveSection = () => {
    return menus.find(menu => pathname.startsWith(menu.path))?.name || '';
  }

  const activeSection = getActiveSection();
  
  const handleValueChange = (value: string | string[]) => {
    if (typeof value === 'string') {
      setOpenItems(prev => ({
        ...prev,
        [value]: !prev[value]
      }))
    }
  }

  // 메뉴 토글 함수
  const toggleSubmenu = (menuName: string, event: React.MouseEvent) => {
    event.preventDefault();
    // 현재 메뉴만 토글하되, 다른 메뉴는 모두 닫기
    setOpenItems(prev => {
      const isCurrentlyOpen = prev[menuName];
      // 현재 메뉴가 열려 있으면 닫고, 닫혀 있으면 다른 메뉴를 모두 닫고 현재 메뉴만 열기
      return isCurrentlyOpen 
        ? { ...prev, [menuName]: false }
        : { [menuName]: true };
    });
  }

  // 사이드바 콘텐츠 렌더링
  const renderSidebarContent = () => {
    // DOCS 모드일 때 문서 사이드바 콘텐츠 렌더링
    if (mode === 'docs') {
      return <DocsSidebarContent />;
    }

    // 기본 사이드바 콘텐츠 렌더링
    return (
      <div className="p-4 flex flex-col h-full justify-between">
        <div className="space-y-4">
          <div className="space-y-2">
            {menus.map((menu) => (
              <div key={menu.name} className="border-0">
                <div className="flex items-center">
                  {/* 메인 메뉴 링크 */}
                  <Link
                    href={menu.path}
                    className={cn(
                      "flex-grow flex items-center p-2 rounded-md transition-colors",
                      isActive(menu.path) 
                        ? "bg-blue-500 text-white font-medium" 
                        : "hover:bg-blue-100 text-gray-700"
                    )}
                  >
                    <span className="w-6 flex justify-center">{menu.icon}</span>
                    <span className="ml-2">{menu.name}</span>
                  </Link>
                </div>
                
                {/* 하위 메뉴 표시 */}
                {menu.submenus && openItems[menu.name] && (
                  <div className="pl-8 space-y-0.5 pt-1 pb-1 sidebar-accordion-content">
                    {menu.submenus.map((submenu, index) => (
                      <Link
                        key={submenu.name}
                        href={submenu.path}
                        className={cn(
                          "block px-2 py-1.5 rounded-md text-sm transition-colors sidebar-submenu-item",
                          pathname === submenu.path 
                            ? "bg-blue-100 text-blue-600 font-medium" 
                            : "text-gray-700 hover:bg-blue-50"
                        )}
                        style={{ 
                          animationDelay: `${index * 50}ms`
                        }}
                      >
                        {submenu.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="rounded-md bg-sidebar-accent/40 p-3 text-sm">
            <p className="text-sidebar-foreground/80 mb-2">기여해주세요</p>
            <p className="text-xs text-sidebar-foreground/70 mb-3">
              로봇 지식 공유에 참여하고 특별한 칭호를 획득하세요.
            </p>
            <Button variant="outline" size="sm" className="w-full justify-start text-blue-500" asChild>
              <Link href="/wiki/create">
                <BookOpen className="h-3.5 w-3.5 mr-1" />
                위키에 기여하기
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="mt-auto pt-4">
          <Separator className="mb-4" />
          <div className="text-xs text-sidebar-foreground/60 text-center">
            <p><Link href="/credits" className="hover:text-blue-500 transition-colors">&copy; {new Date().getFullYear()} HomoSSAFYens</Link></p>
            <p className="mt-1">모든 권리 보유</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 모바일 오버레이 백드롭 */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      
      <aside className={cn(
        "fixed lg:relative inset-y-0 left-0 z-50 w-[280px] lg:w-64 bg-white dark:bg-gray-900",
        "text-sidebar-foreground h-full border-r transition-transform duration-300 ease-in-out",
        "transform", 
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="font-bold">메뉴</span>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(100%-56px)] lg:h-full">
          {renderSidebarContent()}
        </ScrollArea>
      </aside>
    </>
  )
} 
