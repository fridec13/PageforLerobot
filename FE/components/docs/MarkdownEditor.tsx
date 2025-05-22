"use client";

import React, { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MarkdownEditorProps {
  initialValue?: string;
  onSave: (content: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  minHeight?: number;
  preview?: 'live' | 'edit' | 'preview';
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialValue = '',
  onSave,
  onCancel,
  placeholder = '# 내용을 입력하세요',
  minHeight = 400,
  preview = 'live',
}) => {
  const [value, setValue] = useState<string | undefined>(initialValue || placeholder);
  const [isPreviewMode, setIsPreviewMode] = useState(preview === 'preview');

  const handleSave = () => {
    if (value) {
      onSave(value);
    }
  };

  return (
    <Card className="w-full border rounded-md overflow-hidden">
      <div data-color-mode="light" className="w-full">
        {isPreviewMode ? (
          <div className="p-6">
            <MDEditor.Markdown source={value || ''} style={{ minHeight }} />
          </div>
        ) : (
          <MDEditor
            value={value}
            onChange={setValue}
            height={minHeight}
            preview={preview}
            hideToolbar={false}
          />
        )}
      </div>
      <div className="flex items-center justify-between p-4 border-t bg-gray-50">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            {isPreviewMode ? '편집 모드' : '미리보기 모드'}
          </Button>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              취소
            </Button>
          )}
          <Button onClick={handleSave} size="sm">
            저장
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MarkdownEditor; 