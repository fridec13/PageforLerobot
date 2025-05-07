"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, FileText, MessageSquare, Users, Cpu, ChevronDown, ChevronRight } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useState } from "react"

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

export function Sidebar() {
  const pathname = usePathname() || ""
  const [openItems, setOpenItems] = useState<{[key: string]: boolean}>({})

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
        { name: "commit", path: "/docs/commit" },
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
        { name: "about", path: "/forum/about" },
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
        { name: "connect", path: "/robocon/connect" },
        { name: "camera", path: "/robocon/camera" },
        { name: "model", path: "/robocon/model" },
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

  return (
    <aside className="w-64 border-r bg-sidebar-background text-sidebar-foreground flex-shrink-0 h-full">
      <ScrollArea className="h-full">
        <div className="p-4 flex flex-col h-full justify-between">
          <div className="space-y-4">
            <Accordion 
              type="single" 
              collapsible 
              defaultValue={activeSection}
              className="space-y-2"
              onValueChange={handleValueChange}
            >
              {menus.map((menu) => (
                <AccordionItem 
                  key={menu.name} 
                  value={menu.name}
                  className="border-0"
                >
                  {menu.submenus ? (
                    <>
                      <AccordionTrigger 
                        className={cn(
                          "flex items-center p-2 rounded-md transition-colors data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-primary",
                          isActive(menu.path) 
                            ? "bg-sidebar-accent text-sidebar-primary font-medium" 
                            : "hover:bg-sidebar-accent/80"
                        )}
                      >
                        <div className="flex items-center">
                          <span className="w-6 flex justify-center">{menu.icon}</span>
                          <span className="ml-2">{menu.name}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-0 sidebar-accordion-content">
                        <div className="pl-8 space-y-0.5">
                          {menu.submenus.map((submenu, index) => (
                            <Link
                              key={submenu.name}
                              href={submenu.path}
                              className={cn(
                                "block px-2 py-1.5 rounded-md text-sm transition-colors sidebar-submenu-item",
                                pathname === submenu.path 
                                  ? "bg-sidebar-accent text-sidebar-primary font-medium" 
                                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
                              )}
                              style={{ 
                                animationDelay: `${index * 50}ms`,
                                animationPlayState: openItems[menu.name] ? 'running' : 'paused'
                              }}
                            >
                              {submenu.name}
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    </>
                  ) : (
                    <Link
                      href={menu.path}
                      className={cn(
                        "flex items-center p-2 rounded-md transition-colors font-medium",
                        isActive(menu.path) 
                          ? "bg-sidebar-accent text-sidebar-primary" 
                          : "hover:bg-sidebar-accent/80"
                      )}
                    >
                      <span className="w-6 flex justify-center">{menu.icon}</span>
                      <span className="ml-2">{menu.name}</span>
                    </Link>
                  )}
                </AccordionItem>
              ))}
            </Accordion>
            
            <Separator className="my-4" />
            
            <div className="rounded-md bg-sidebar-accent/40 p-3 text-sm">
              <p className="text-sidebar-foreground/80 mb-2">기여해주세요</p>
              <p className="text-xs text-sidebar-foreground/70 mb-3">
                로봇 지식 공유에 참여하고 특별한 칭호를 획득하세요.
              </p>
              <Button variant="outline" size="sm" className="w-full justify-start text-blue-500">
                <BookOpen className="h-3.5 w-3.5 mr-1" />
                위키에 기여하기
              </Button>
            </div>
          </div>
          
          <div className="mt-auto pt-4">
            <Separator className="mb-4" />
            <div className="text-xs text-sidebar-foreground/60 text-center">
              <p>&copy; {new Date().getFullYear()} RoboSSAFYens</p>
              <p className="mt-1">모든 권리 보유</p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  )
} 