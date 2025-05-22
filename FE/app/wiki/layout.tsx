"use client"

import React, { useState, FormEvent, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/auth"

interface WikiLayoutProps {
  children: React.ReactNode
}

// 위키 카테고리 객체 타입 정의
interface WikiCategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
}

export default function WikiLayout({ children }: WikiLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [documentTitle, setDocumentTitle] = useState("")
  const [categories, setCategories] = useState<WikiCategory[]>([])
  
  const isMainWikiPage = pathname === "/wiki"
  const isSearchPage = pathname === "/wiki/search"
  const isDetailPage = pathname.includes("/wiki/") && pathname !== "/wiki/create" && pathname !== "/wiki/search"
  
  // 문서 제목 및 카테고리 업데이트를 위한 이벤트 리스너
  useEffect(() => {
    const handleTitleUpdate = (e: CustomEvent<{ title: string, categories: WikiCategory[] }>) => {
      setDocumentTitle(e.detail.title)
      setCategories(e.detail.categories || [])
    }
    
    window.addEventListener('updateWikiTitle', handleTitleUpdate as EventListener)
    
    return () => {
      window.removeEventListener('updateWikiTitle', handleTitleUpdate as EventListener)
    }
  }, [])
  
  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/wiki/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }
  
  const handleCreateDocument = () => {
    if (isAuthenticated) {
      router.push("/wiki/create")
    } else {
      router.push("/auth/login?returnUrl=/wiki/create")
    }
  }

  // 카테고리 슬러그에 따른 배지 색상 지정
  const getBadgeColor = (slug?: string): string => {
    if (!slug) return 'blue'
    
    const colorMap: Record<string, string> = {
      'basics': 'blue',
      'hardware': 'green',
      'software': 'purple',
      'ai': 'orange',
      'sensors': 'red',
      'applications': 'yellow',
      'programming': 'indigo',
      'future': 'cyan',
      'technology': 'green',
      'control': 'red',
      'autonomous': 'teal',
      'ros': 'violet'
    }
    
    return colorMap[slug] || 'blue'
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-y-4 mb-6">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <h1 className="text-2xl md:text-3xl font-bold truncate max-w-[280px] md:max-w-md">
            {isMainWikiPage && "위키에 오신 것을 환영합니다"}
            {isSearchPage && "위키 검색"}
            {isDetailPage && documentTitle ? documentTitle : (!isMainWikiPage && !isSearchPage && "위키")}
          </h1>
          {isDetailPage && categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {categories.slice(0, 2).map(category => (
                <Badge 
                  key={category.id}
                  variant="outline"
                  className={`bg-${getBadgeColor(category.slug)}-50 text-${getBadgeColor(category.slug)}-800 border-${getBadgeColor(category.slug)}-200`}
                >
                  {category.name}
                </Badge>
              ))}
              {categories.length > 2 && (
                <Badge variant="outline">+{categories.length - 2}</Badge>
              )}
            </div>
          )}
        </div>
        <form onSubmit={handleSearch} className="flex w-full md:w-auto items-center gap-2">
          <Button 
            type="button"
            onClick={handleCreateDocument}
            variant="outline"
            className="flex items-center gap-1 whitespace-nowrap"
            size="sm"
            title="새 문서 작성"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">새 문서</span>
            <span className="sm:hidden">문서</span>
          </Button>
          <div className="relative flex-1 max-w-[200px] sm:max-w-xs">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-8 h-9" 
              placeholder="위키 검색..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="default" size="sm" className="h-9 px-2">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>
      
      {children}
    </div>
  )
} 