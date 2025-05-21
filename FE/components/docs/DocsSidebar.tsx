"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Book, Folder } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// 문서 카테고리 타입 정의
interface DocumentCategory {
  id: string;
  name: string;
  slug: string;
  documents: Document[];
  subCategories?: DocumentCategory[];
}

// 문서 타입 정의
interface Document {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
}

interface DocsSidebarProps {
  categories: DocumentCategory[];
}

const DocsSidebar: React.FC<DocsSidebarProps> = ({ categories }) => {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

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
    <div className="docs-sidebar w-64 bg-white border-r h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="font-bold text-lg mb-4">문서 목록</h2>
        <div className="space-y-1">
          {categories.map(category => renderCategory(category))}
        </div>
      </div>
    </div>
  );
};

export default DocsSidebar; 