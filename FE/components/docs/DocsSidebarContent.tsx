"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Book, Folder } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useSidebar, DocumentCategory } from '@/lib/contexts/SidebarContext';

const DocsSidebarContent = () => {
  const pathname = usePathname();
  const { docCategories } = useSidebar();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // 경로에 맞춰 카테고리 자동 확장
  useEffect(() => {
    if (pathname.startsWith('/docs/')) {
      // 문서 페이지 경로에서 카테고리 ID 확인 시도
      const currentDocId = pathname.split('/').pop();
      
      if (currentDocId) {
        // 현재 문서가 속한 카테고리 찾기
        for (const category of docCategories) {
          // 직접 속한 문서 확인
          const isDirectDoc = category.documents.some(doc => doc.slug === currentDocId);
          if (isDirectDoc) {
            setExpandedCategories(prev => ({ ...prev, [category.id]: true }));
            break;
          }
          
          // 하위 카테고리 확인
          if (category.subCategories) {
            let found = false;
            for (const subCategory of category.subCategories) {
              if (subCategory.documents.some(doc => doc.slug === currentDocId)) {
                setExpandedCategories(prev => ({ 
                  ...prev, 
                  [category.id]: true,
                  [subCategory.id]: true 
                }));
                found = true;
                break;
              }
            }
            if (found) break;
          }
        }
      }
    }
  }, [pathname, docCategories]);
  
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const renderCategory = (category: DocumentCategory, depth = 0) => {
    const isExpanded = expandedCategories[category.id] ?? false;
    const hasSubItems = (category.documents.length > 0 || (category.subCategories && category.subCategories.length > 0));

    return (
      <div key={category.id} className="mb-1">
        {/* 카테고리 헤더 */}
        <div 
          className={cn(
            "flex items-center py-2 px-3 rounded-md cursor-pointer",
            depth === 0 ? "text-sm font-medium" : "text-sm",
            hasSubItems ? "hover:bg-gray-100" : ""
          )}
          onClick={() => hasSubItems && toggleCategory(category.id)}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
        >
          {hasSubItems ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 mr-1 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1 text-gray-500" />
            )
          ) : (
            <div className="w-5" />
          )}
          <Folder className="h-4 w-4 mr-2 text-blue-500" />
          <span>{category.name}</span>
        </div>

        {/* 문서 목록 */}
        {isExpanded && (
          <div className="mt-1">
            {category.documents.map(doc => (
              <Link key={doc.id} href={`/docs/${doc.slug}`}>
                <div 
                  className={cn(
                    "flex items-center py-2 text-sm",
                    pathname === `/docs/${doc.slug}` 
                      ? "bg-blue-50 text-blue-600 font-medium" 
                      : "text-gray-700 hover:bg-gray-50",
                    "rounded-md"
                  )}
                  style={{ paddingLeft: `${depth * 12 + 32}px` }}
                >
                  <Book className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{doc.title}</span>
                </div>
              </Link>
            ))}

            {/* 하위 카테고리 렌더링 */}
            {category.subCategories?.map(subCategory => 
              renderCategory(subCategory, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="docs-sidebar-content w-full p-4">
      <h2 className="font-bold text-base mb-4">문서 목록</h2>
      <div className="space-y-1">
        {docCategories.map(category => renderCategory(category))}
      </div>
    </div>
  );
};

export default DocsSidebarContent; 