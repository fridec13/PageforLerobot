"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import Image from 'next/image';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnhancedMarkdownViewerProps {
  content: string;
  className?: string;
}

export const EnhancedMarkdownViewer: React.FC<EnhancedMarkdownViewerProps> = ({
  content,
  className = '',
}) => {
  // 사용자 정의 마크다운 컴포넌트
  const components = {
    // 코드 블록 처리
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      
      // 인라인 코드
      if (inline) {
        return (
          <code className="bg-gray-100 text-red-500 px-1 py-0.5 rounded text-sm" {...props}>
            {children}
          </code>
        );
      }
      
      // 특별한 형식의 블록 처리 (경고문, 정보 등)
      if (match && match[1] === 'warning') {
        return (
          <Alert className="my-4 bg-yellow-50 border-yellow-200">
            <AlertTitle className="text-yellow-800 font-medium">주의</AlertTitle>
            <AlertDescription className="text-yellow-700">
              {children}
            </AlertDescription>
          </Alert>
        );
      }
      
      if (match && match[1] === 'info') {
        return (
          <Alert className="my-4 bg-blue-50 border-blue-200">
            <AlertTitle className="text-blue-800 font-medium">정보</AlertTitle>
            <AlertDescription className="text-blue-700">
              {children}
            </AlertDescription>
          </Alert>
        );
      }
      
      if (match && match[1] === 'success') {
        return (
          <Alert className="my-4 bg-green-50 border-green-200">
            <AlertTitle className="text-green-800 font-medium">성공</AlertTitle>
            <AlertDescription className="text-green-700">
              {children}
            </AlertDescription>
          </Alert>
        );
      }
      
      // 코드 블록
      return (
        <div className="rounded-md overflow-hidden my-4">
          <SyntaxHighlighter
            language={match ? match[1] : 'text'}
            style={tomorrow}
            customStyle={{ margin: 0, borderRadius: '0.375rem' }}
            showLineNumbers
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      );
    },
    
    // 테이블 커스터마이징
    table({ node, children, ...props }: any) {
      return (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full divide-y divide-gray-200 border" {...props}>
            {children}
          </table>
        </div>
      );
    },
    
    thead({ node, children, ...props }: any) {
      return (
        <thead className="bg-gray-50" {...props}>
          {children}
        </thead>
      );
    },
    
    th({ node, children, ...props }: any) {
      return (
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          {...props}
        >
          {children}
        </th>
      );
    },
    
    td({ node, children, ...props }: any) {
      return (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" {...props}>
          {children}
        </td>
      );
    },
    
    // 이미지 처리
    img({ node, ...props }: any) {
      return (
        <div className="flex justify-center my-6">
          <div className="overflow-hidden rounded-md max-w-full">
            <img 
              src={props.src} 
              alt={props.alt || ''} 
              className="max-w-full h-auto" 
              loading="lazy"
            />
            {props.alt && (
              <div className="text-center text-sm text-gray-500 mt-2">{props.alt}</div>
            )}
          </div>
        </div>
      );
    },
    
    // 링크 처리
    a({ node, children, ...props }: any) {
      const href = props.href || '';
      const isExternal = href.startsWith('http') && !href.startsWith(window.location.origin);
      
      return (
        <a 
          href={href}
          className="text-blue-600 hover:underline"
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          {...props}
        >
          {children}
        </a>
      );
    }
  };

  return (
    <Card className={cn("p-6 w-full overflow-hidden", className)}>
      <div className="prose max-w-none dark:prose-invert break-words">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    </Card>
  );
};

export default EnhancedMarkdownViewer; 