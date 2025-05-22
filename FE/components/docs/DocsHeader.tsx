"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ChevronRight, Edit, FileText, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DocsHeaderProps {
  title?: string;
  category?: string;
  categorySlug?: string;
  isDetailPage?: boolean;
  documentId?: string;
  currentUserRole?: 'user' | 'moderator' | 'admin';
}

const DocsHeader: React.FC<DocsHeaderProps> = ({
  title,
  category,
  categorySlug,
  isDetailPage = false,
  documentId,
  currentUserRole = 'user'
}) => {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const isAdmin = currentUserRole === 'admin' || currentUserRole === 'moderator';
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 검색 로직 구현
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="docs-header border-b">
      <div className="container py-4">
        {/* 검색 및 문서 작성 버튼 */}
        <div className="flex items-center justify-between mb-4">
          <form onSubmit={handleSearch} className="relative flex-grow max-w-md">
            <Input
              type="text"
              placeholder="문서 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>
          
          {isAdmin && (
            <Button asChild>
              <Link href="/docs/admin/create">
                <FileText className="h-4 w-4 mr-1" />
                새 문서 작성
              </Link>
            </Button>
          )}
        </div>

        {/* 문서 경로 및 제목 */}
        {isDetailPage ? (
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <Link href="/docs" className="hover:text-blue-600">문서</Link>
              <ChevronRight className="h-4 w-4 mx-1" />
              {category && categorySlug && (
                <>
                  <Link href={`/docs/${categorySlug}`} className="hover:text-blue-600">{category}</Link>
                  <ChevronRight className="h-4 w-4 mx-1" />
                </>
              )}
              <span>{title}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{title}</h1>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/docs/${documentId}/history`}>
                    <History className="h-4 w-4 mr-1" />
                    수정 이력
                  </Link>
                </Button>
                
                {isAdmin ? (
                  <Button size="sm" asChild>
                    <Link href={`/docs/${documentId}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      편집
                    </Link>
                  </Button>
                ) : (
                  <Button size="sm" asChild>
                    <Link href={`/docs/${documentId}/suggest`}>
                      <Edit className="h-4 w-4 mr-1" />
                      수정 제안
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <h1 className="text-2xl font-bold">{title || '기술 문서'}</h1>
        )}
      </div>
    </header>
  );
};

export default DocsHeader; 