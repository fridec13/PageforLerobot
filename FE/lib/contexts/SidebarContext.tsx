"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

// 사이드바 모드 타입 정의
export type SidebarMode = 'default' | 'docs';

// 문서 카테고리 타입 정의
export interface DocumentCategory {
  id: string;
  name: string;
  slug: string;
  documents: Document[];
  subCategories?: DocumentCategory[];
}

// 문서 타입 정의
export interface Document {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
}

// 사이드바 컨텍스트 타입 정의
interface SidebarContextProps {
  mode: SidebarMode;
  setMode: (mode: SidebarMode) => void;
  docCategories: DocumentCategory[];
  setDocCategories: (categories: DocumentCategory[]) => void;
}

// 기본값으로 컨텍스트 생성
export const SidebarContext = createContext<SidebarContextProps>({
  mode: 'default',
  setMode: () => {},
  docCategories: [],
  setDocCategories: () => {}
});

// 컨텍스트 사용을 위한 커스텀 훅
export const useSidebar = () => useContext(SidebarContext);

// 컨텍스트 제공자 컴포넌트
interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [mode, setMode] = useState<SidebarMode>('default');
  const [docCategories, setDocCategories] = useState<DocumentCategory[]>([]);

  return (
    <SidebarContext.Provider value={{
      mode,
      setMode,
      docCategories,
      setDocCategories
    }}>
      {children}
    </SidebarContext.Provider>
  );
} 