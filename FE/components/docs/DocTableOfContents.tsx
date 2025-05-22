"use client";

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface DocTableOfContentsProps {
  className?: string;
}

const DocTableOfContents: React.FC<DocTableOfContentsProps> = ({ 
  className 
}) => {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  
  // 문서 내 헤딩 요소 추출
  useEffect(() => {
    const contentElement = document.querySelector('.prose');
    if (!contentElement) return;
    
    const headers = Array.from(contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .filter(element => !!element.id)
      .map(element => ({
        id: element.id,
        text: element.textContent || '',
        level: parseInt(element.tagName.substring(1), 10)
      }));
    
    setHeadings(headers);
  }, []);

  // 스크롤 위치에 따른 활성 헤딩 설정
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { 
        rootMargin: '0px 0px -80% 0px',
        threshold: 0.1 
      }
    );

    // 관찰 시작
    headings.forEach(heading => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className={cn("p-4 bg-gray-50 rounded-md", className)}>
      <h2 className="text-sm font-medium text-gray-900 mb-4">목차</h2>
      <ul className="space-y-1 text-sm">
        {headings.map((heading) => (
          <li 
            key={heading.id}
            className={cn(
              "line-clamp-2",
              heading.level === 1 && "ml-0",
              heading.level === 2 && "ml-2",
              heading.level === 3 && "ml-4",
              heading.level === 4 && "ml-6",
              heading.level >= 5 && "ml-8"
            )}
          >
            <a
              href={`#${heading.id}`}
              className={cn(
                "block py-1 text-gray-600 hover:text-blue-600 transition-colors",
                activeId === heading.id && "text-blue-600 font-medium"
              )}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
                setActiveId(heading.id);
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DocTableOfContents; 