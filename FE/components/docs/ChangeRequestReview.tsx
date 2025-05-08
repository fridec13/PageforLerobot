"use client";

import React, { useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { Document, DocumentChangeRequest } from '@/lib/models/docs';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import MarkdownViewer from './MarkdownViewer';
import { formatDate } from '@/lib/utils';

interface ChangeRequestReviewProps {
  document: Document;
  changeRequest: DocumentChangeRequest;
  onApprove: (requestId: string, comment: string) => Promise<void>;
  onReject: (requestId: string, comment: string) => Promise<void>;
  onClose?: () => void;
}

export const ChangeRequestReview: React.FC<ChangeRequestReviewProps> = ({
  document,
  changeRequest,
  onApprove,
  onReject,
  onClose,
}) => {
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onApprove(changeRequest.id, reviewComment);
    } catch (error) {
      setError('변경 요청을 승인하는 중 오류가 발생했습니다.');
      console.error('승인 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onReject(changeRequest.id, reviewComment);
    } catch (error) {
      setError('변경 요청을 거부하는 중 오류가 발생했습니다.');
      console.error('거부 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>변경 요청 검토</CardTitle>
        <CardDescription>
          <div className="flex flex-col gap-1">
            <div>요청자: {changeRequest.proposedBy}</div>
            <div>요청일: {formatDate(changeRequest.createdAt)}</div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="diff" className="mb-4">
          <TabsList>
            <TabsTrigger value="diff">변경 사항 비교</TabsTrigger>
            <TabsTrigger value="preview">미리보기</TabsTrigger>
          </TabsList>
          <TabsContent value="diff" className="border rounded-md p-4">
            <ReactDiffViewer
              oldValue={document.content}
              newValue={changeRequest.proposedContent}
              splitView={true}
              useDarkTheme={false}
              hideLineNumbers={false}
              leftTitle="현재 문서"
              rightTitle="제안된 변경"
            />
          </TabsContent>
          <TabsContent value="preview">
            <h3 className="text-lg font-semibold mb-2">변경 후 미리보기</h3>
            <MarkdownViewer content={changeRequest.proposedContent} />
          </TabsContent>
        </Tabs>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            검토 의견
          </label>
          <Textarea
            placeholder="변경 요청에 대한 의견을 작성해주세요."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            rows={4}
            className="w-full"
          />
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={isSubmitting}
          >
            거부
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isSubmitting}
          >
            승인
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChangeRequestReview; 