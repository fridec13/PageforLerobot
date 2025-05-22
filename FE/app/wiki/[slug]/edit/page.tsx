"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialogHeader, AlertDialogFooter, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthStore } from "@/lib/auth"
import { WikiDocument } from "@/lib/models/wiki"
import wikiService from "@/lib/services/wikiService"
import { parseWikiText } from "@/lib/utils"

const formSchema = z.object({
  content: z.string().min(10, "문서 내용은 최소 10자 이상이어야 합니다"),
  editSummary: z.string().optional()
})

export default function WikiDocumentEditPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const slug = params.slug as string
  
  const [document, setDocument] = useState<WikiDocument | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("edit")
  
  const previewRef = useRef<HTMLDivElement>(null)
  
  // 문서 정보 가져오기
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const documentData = await wikiService.getDocumentBySlug(slug)
        setDocument(documentData)
        
        if (typeof window !== 'undefined') {
          window.document.title = `${documentData.title} 편집 - RoboSSAFYens 위키`;
          
          // 헤더 제목 업데이트를 위한 커스텀 이벤트
          window.dispatchEvent(new CustomEvent('updateWikiTitle', {
            detail: { 
              title: `${documentData.title} 편집`,
              categories: documentData.categories
            }
          }));
        }
        
        form.reset({ content: documentData.content, editSummary: "" });
      } catch (error: any) {
        console.error(`위키 문서 로드 실패 (${slug}):`, error)
        setError(error.message || "문서를 불러올 수 없습니다.")
      } finally {
        setIsLoading(false)
      }
    }
    
    if (!isAuthenticated) {
      router.push(`/auth/login?returnUrl=/wiki/${slug}/edit`)
      return
    }
    
    fetchDocument()
    
    return () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('updateWikiTitle', {
          detail: { title: '', categories: [] }
        }));
      }
    }
  }, [slug, isAuthenticated, router])
  
  // 폼 정의
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      editSummary: ""
    }
  })
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!document || !user) return
    
    try {
      setSaving(true)
      
      await wikiService.updateDocument(
        slug,
        {
          content: values.content,
        },
        values.editSummary || "문서 수정"
      );
      
      router.push(`/wiki/${slug}`)
      router.refresh()
    } catch (error: any) {
      console.error('문서 저장 실패:', error)
      setError(error.message || "문서를 저장하는데 실패했습니다.")
      setSaving(false)
    }
  }
  
  // 미리보기 탭 전환
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    
    if (value === "preview") {
      if (previewRef.current) {
        // 주석 요소 숨기기
        const commentElements = previewRef.current.querySelectorAll('.comment');
        commentElements.forEach((el) => {
          el.classList.add('hidden');
        });
      }
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (error || !document) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertDescription>
          <p>{error || "문서를 찾을 수 없습니다."}</p>
          <Button
            variant="outline"
            onClick={() => router.push(`/wiki/${slug}`)}
            className="mt-4"
          >
            문서로 돌아가기
          </Button>
        </AlertDescription>
      </Alert>
    )
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">{document.title} 편집</h1>
                <div className="flex items-center space-x-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" type="button">취소</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>편집을 취소하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                          저장하지 않은 변경사항은 모두 사라집니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>계속 편집</AlertDialogCancel>
                        <AlertDialogAction onClick={() => router.push(`/wiki/${slug}`)}>
                          편집 취소
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button type="submit" disabled={saving}>
                    {saving ? "저장 중..." : "저장"}
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue="edit" value={activeTab} onValueChange={handleTabChange}>
                <TabsList>
                  <TabsTrigger value="edit">편집</TabsTrigger>
                  <TabsTrigger value="preview">미리보기</TabsTrigger>
                </TabsList>
                <Separator className="my-4" />
                
                <FormField
                  control={form.control}
                  name="editSummary"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="편집 요약 (선택사항)"
                          {...field}
                          className="mb-4 w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <TabsContent value="edit" className="mt-0">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="== 제목 ==
                            
이 문서는 RoboSSAFYens 위키의 문서입니다. 위키 문법을 사용하여 작성할 수 있습니다.
- 제목: == 제목 == / === 소제목 === / ==== 소소제목 ====
- 굵게: '''굵은 글씨'''
- 기울임: ''기울임체''
- 링크: [[문서명]] 또는 [[문서명|표시명]]
- 목록: * 항목 (여러 줄 작성)
- 주석: <!-- 주석 내용 -->
- 각주: {{각주|각주 설명}}
"
                            className="min-h-[500px] font-mono" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="preview" className="mt-0">
                  <div 
                    ref={previewRef}
                    className="min-h-[500px] p-4 border rounded-md prose prose-blue max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ 
                      __html: form.getValues("content") 
                        ? parseWikiText(form.getValues("content"), true) 
                        : '<div class="text-gray-400">미리보기 내용이 없습니다</div>' 
                    }}
                  />
                </TabsContent>
              </Tabs>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 