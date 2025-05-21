"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Edit, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import docsService, { Document } from '@/lib/services/docsService';
import { useAuth } from '@/lib/auth';

export default function SuggestionPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    documentPath: '',
    documentId: '',
    suggestedContent: '',
    reason: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  useEffect(() => {
    const fetchRecentDocuments = async () => {
      try {
        const docs = await docsService.getRecentDocuments(5);
        setRecentDocuments(docs);
      } catch (error) {
        console.error('최근 문서 로딩 중 오류:', error);
        toast({
          title: "문서 로딩 실패",
          description: "최근 문서를 불러오는데 실패했습니다.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentDocuments();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentSelect = async (doc: Document) => {
    setFormData(prev => ({
      ...prev,
      documentPath: doc.path,
      documentId: doc.id
    }));
    setSelectedDocument(doc);
  };

  const loadDocumentContent = async () => {
    if (!formData.documentPath && !formData.documentId) {
      toast({
        title: "문서를 선택해주세요",
        description: "수정할 문서를 먼저 선택해야 합니다.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      let doc: Document | null = null;
      
      if (formData.documentId) {
        doc = await docsService.getDocumentById(formData.documentId);
      } else if (formData.documentPath) {
        // URL에서 ID 추출 시도
        const pathParts = formData.documentPath.split('/');
        const possibleId = pathParts[pathParts.length - 1];
        doc = await docsService.getDocumentById(possibleId);
        
        // 실패하면 경로로 시도
        if (!doc) {
          doc = await docsService.getDocumentByPath(formData.documentPath);
        }
      }

      if (!doc) {
        toast({
          title: "문서를 찾을 수 없습니다",
          description: "입력한 경로 또는 URL의 문서를 찾을 수 없습니다.",
          variant: "destructive"
        });
        return;
      }

      setSelectedDocument(doc);
      setFormData(prev => ({
        ...prev,
        documentId: doc?.id || '',
        documentPath: doc?.path || '',
        suggestedContent: doc?.content || ''
      }));
      setStep(2);
    } catch (error) {
      console.error('문서 로딩 중 오류:', error);
      toast({
        title: "문서 로딩 실패",
        description: "문서를 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.documentId || !formData.suggestedContent || !formData.reason) {
      toast({
        title: "필수 정보 누락",
        description: "문서 ID, 수정 내용, 수정 이유는 필수입니다.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = user?.id || 'anonymous';
      await docsService.createChangeRequest(
        formData.documentId,
        formData.suggestedContent,
        formData.reason,
        userId
      );
      
      setStep(3);
      toast({
        title: "제안이 제출되었습니다",
        description: "모더레이터가 검토 후 반영 여부를 결정합니다.",
      });
    } catch (error) {
      console.error('변경 제안 제출 중 오류:', error);
      toast({
        title: "제안 제출 실패",
        description: "변경 제안을 제출하는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/docs" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>문서 목록으로 돌아가기</span>
        </Link>
        <h1 className="text-3xl font-bold mb-2">문서 수정 제안</h1>
        <p className="text-gray-600">
          기술 문서의 개선을 위한 수정 사항을 제안할 수 있습니다.
        </p>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>문서 선택</CardTitle>
            <CardDescription>수정하고자 하는 문서를 선택하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">문서 URL 또는 경로</label>
                <Input
                  name="documentPath"
                  placeholder="/docs/doc_1 또는 전체 URL"
                  value={formData.documentPath}
                  onChange={handleInputChange}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  예시: /docs/doc_1 또는 https://robossafyens.com/docs/doc_1
                </p>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-lg mb-2">또는 최근 문서에서 선택</h3>
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentDocuments.map(doc => (
                      <div 
                        key={doc.id}
                        className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleDocumentSelect(doc)}
                      >
                        <div className="font-medium">{doc.title}</div>
                        <div className="text-sm text-gray-500">{doc.path}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              취소
            </Button>
            <Button 
              onClick={loadDocumentContent} 
              disabled={!formData.documentPath && !formData.documentId || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  로딩 중...
                </>
              ) : (
                "다음"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>수정 내용 작성</CardTitle>
            <CardDescription>수정하고자 하는 내용과 이유를 작성하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">선택한 문서</label>
                <div className="p-3 bg-gray-50 rounded-md">
                  {selectedDocument?.title || formData.documentPath}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block" htmlFor="suggestedContent">제안하는 내용</label>
                <Textarea
                  id="suggestedContent"
                  name="suggestedContent"
                  placeholder="수정하고자 하는 내용을 작성하세요. 마크다운 형식을 지원합니다."
                  value={formData.suggestedContent}
                  onChange={handleInputChange}
                  rows={8}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block" htmlFor="reason">수정 이유</label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="이 수정을 제안하는 이유를 설명해주세요."
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block" htmlFor="email">이메일 (선택사항)</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="검토 결과를 받을 이메일 주소"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-gray-500 mt-1">
                  제안 검토 결과를 받으시려면 이메일을 입력하세요.
                </p>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-semibold">수정 제안 프로세스</p>
                  <p className="mt-1">
                    제출된 수정 제안은 모더레이터가 검토한 후 적절한 경우 문서에 반영됩니다.
                    검토에는 일반적으로 1-3일이 소요됩니다.
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              이전
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!formData.suggestedContent || !formData.reason || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  제출 중...
                </>
              ) : (
                "제안 제출"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>제안이 제출되었습니다</CardTitle>
            <CardDescription>검토 후 반영 여부를 결정합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p>
                문서 수정 제안을 제출해주셔서 감사합니다. 
                모더레이터가 제안 내용을 검토하여 적절한 경우 문서에 반영하겠습니다.
              </p>
              <p>
                이메일을 입력하셨다면, 검토 결과를 이메일로 알려드립니다.
              </p>
              
              <div className="p-4 bg-gray-50 rounded-md text-left">
                <p className="font-medium">제안 내용 요약</p>
                <div className="mt-2 text-sm">
                  <p><strong>문서:</strong> {selectedDocument?.title || formData.documentPath}</p>
                  <p><strong>수정 이유:</strong> {formData.reason.substring(0, 100)}{formData.reason.length > 100 ? '...' : ''}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <Link href="/docs">문서 홈으로</Link>
              </Button>
              <Button asChild>
                <Link href={`/docs/${formData.documentId}`}>원본 문서 보기</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 