"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Tag, File, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

interface SearchResult {
  id: string;
  type: "document" | "forum" | "wiki";
  title: string;
  path: string;
  excerpt: string;
  category?: string;
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 검색어가 2글자 이상일 때만 검색
    if (debouncedQuery.length >= 2) {
      setIsLoading(true);
      
      // 실제 API 호출
      fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setResults(data);
          } else if (data.error) {
            console.error("검색 오류:", data.error);
            setResults([]);
          } else {
            setResults([]);
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error("검색 중 오류 발생:", err);
          setIsLoading(false);
          setResults([]);
        });

    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  // Enter 키 누를 때 첫 번째 결과로 이동
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && results.length > 0) {
      router.push(results[0].path);
      setOpen(false);
    }
  };

  // 결과 유형에 따른 아이콘 표시
  const getIconForType = (type: string) => {
    switch (type) {
      case "document":
        return <File className="h-4 w-4 text-blue-500" />;
      case "wiki":
        return <Tag className="h-4 w-4 text-green-500" />;
      case "forum":
        return <MessageSquare className="h-4 w-4 text-orange-500" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="w-9 px-0">
          <Search className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>검색</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="문서, 위키, 포럼 검색..."
              className="pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          
          {query.length > 0 && (
            <div>
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : results.length > 0 ? (
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-1">
                    {results.map((result) => (
                      <Link 
                        key={result.id}
                        href={result.path}
                        onClick={() => setOpen(false)}
                        className="block p-2 hover:bg-accent rounded-md"
                      >
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">{getIconForType(result.type)}</div>
                          <div>
                            <div className="font-medium">{result.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{result.excerpt}</div>
                            {result.category && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {result.category}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
 