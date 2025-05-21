"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageSquare, Flag, Share2, Bookmark, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocToolbarProps {
  documentId: string;
  lastUpdated: string;
  className?: string;
  onFeedbackSubmit?: (type: 'like' | 'dislike') => void;
  onShare?: () => void;
  onBookmark?: () => void;
}

const DocToolbar: React.FC<DocToolbarProps> = ({
  documentId,
  lastUpdated,
  className,
  onFeedbackSubmit,
  onShare,
  onBookmark
}) => {
  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('문서 링크가 클립보드에 복사되었습니다.');
        })
        .catch(err => {
          console.error('링크 복사 실패:', err);
        });
    }
  };
  
  return (
    <div className={cn("border-t mt-8 pt-6", className)}>
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 items-start">
        {/* 문서 피드백 영역 */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">이 문서가 도움이 되었나요?</h3>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => onFeedbackSubmit?.('like')}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>네</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => onFeedbackSubmit?.('dislike')}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>아니오</span>
            </Button>
          </div>
        </div>
        
        {/* 문서 도구 영역 */}
        <div className="flex flex-col sm:items-end">
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/docs/${documentId}/discuss`}>
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>논의</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" />
              <span>공유</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onBookmark}>
              <Bookmark className="h-4 w-4 mr-1" />
              <span>저장</span>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/docs/${documentId}/report`}>
                <Flag className="h-4 w-4 mr-1" />
                <span>신고</span>
              </Link>
            </Button>
          </div>
          
          <div className="text-xs text-gray-500">
            마지막 업데이트: {lastUpdated}
          </div>
        </div>
      </div>
      
      {/* 이전/다음 문서 네비게이션 - 실제 구현시 데이터 연결 필요 */}
      <div className="flex justify-between border-t mt-6 pt-6">
        <Button variant="link" size="sm" className="flex items-center justify-start px-0" asChild>
          <Link href="#">
            <span>← 이전: RoboDK 설치 가이드</span>
          </Link>
        </Button>
        <Button variant="link" size="sm" className="flex items-center justify-end px-0" asChild>
          <Link href="#">
            <span>다음: RoboDK 사용법 →</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default DocToolbar; 