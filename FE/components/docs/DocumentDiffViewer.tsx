"use client";

import React, { useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { Document, DocumentHistory } from '@/lib/models/docs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DocumentDiffViewerProps {
  document: Document;
  history: DocumentHistory[];
  onClose?: () => void;
}

export const DocumentDiffViewer: React.FC<DocumentDiffViewerProps> = ({
  document,
  history,
  onClose,
}) => {
  // 이력 중 첫 번째 버전과 현재 버전을 기본으로 선택
  const [leftVersionId, setLeftVersionId] = useState<string>(
    history.length > 0 ? history[history.length - 1].id : ''
  );
  const [rightVersionId, setRightVersionId] = useState<string>('current');

  // 선택된 버전의 내용 가져오기
  const getVersionContent = (versionId: string): string => {
    if (versionId === 'current') {
      return document.content;
    }
    const historyItem = history.find(item => item.id === versionId);
    return historyItem ? historyItem.content : '';
  };

  // 버전 정보 가져오기
  const getVersionInfo = (versionId: string): { version: number; date: Date; editedBy: string } => {
    if (versionId === 'current') {
      return {
        version: document.version,
        date: document.updatedAt,
        editedBy: document.lastEditedBy,
      };
    }
    const historyItem = history.find(item => item.id === versionId);
    return historyItem
      ? {
          version: historyItem.version,
          date: historyItem.editedAt,
          editedBy: historyItem.editedBy,
        }
      : { version: 0, date: new Date(), editedBy: '' };
  };

  const leftContent = getVersionContent(leftVersionId);
  const rightContent = getVersionContent(rightVersionId);
  const leftVersionInfo = getVersionInfo(leftVersionId);
  const rightVersionInfo = getVersionInfo(rightVersionId);

  // 버전 이동
  const moveToNextVersion = () => {
    const currentIndex = history.findIndex(h => h.id === leftVersionId);
    if (currentIndex > 0) {
      setLeftVersionId(history[currentIndex - 1].id);
    } else if (currentIndex === 0) {
      setLeftVersionId('current');
    }
  };

  const moveToPrevVersion = () => {
    if (leftVersionId === 'current') {
      if (history.length > 0) {
        setLeftVersionId(history[0].id);
      }
    } else {
      const currentIndex = history.findIndex(h => h.id === leftVersionId);
      if (currentIndex < history.length - 1) {
        setLeftVersionId(history[currentIndex + 1].id);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>문서 버전 비교</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={moveToPrevVersion}
                disabled={leftVersionId === history[history.length - 1]?.id}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <Select
                value={leftVersionId}
                onValueChange={setLeftVersionId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="버전 선택" />
                </SelectTrigger>
                <SelectContent>
                  {history.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      v{item.version} ({formatDate(item.editedAt)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                size="icon"
                onClick={moveToNextVersion}
                disabled={leftVersionId === 'current'}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              버전 {leftVersionInfo.version} | {formatDate(leftVersionInfo.date)} | 
              편집자: {leftVersionInfo.editedBy}
            </div>
          </div>

          <div>
            <Select
              value={rightVersionId}
              onValueChange={setRightVersionId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="버전 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">
                  현재 버전 (v{document.version})
                </SelectItem>
                {history.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    v{item.version} ({formatDate(item.editedAt)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-500 mt-2">
              버전 {rightVersionInfo.version} | {formatDate(rightVersionInfo.date)} | 
              편집자: {rightVersionInfo.editedBy}
            </div>
          </div>
        </div>

        <div className="border rounded-md">
          <ReactDiffViewer
            oldValue={leftContent}
            newValue={rightContent}
            splitView={true}
            useDarkTheme={false}
            hideLineNumbers={false}
          />
        </div>
      </CardContent>
      {onClose && (
        <CardFooter className="justify-end">
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default DocumentDiffViewer;