import './globals.css'
import { ClientLayout } from '@/app/client-layout'
import { SidebarProvider } from '@/lib/contexts/SidebarContext'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | SOARM100 3D 모델 뷰어',
    default: 'SOARM100 3D 모델 뷰어',
  },
  description: 'SOARM100 로봇 팔 3D 모델 뷰어',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/variable/pretendardvariable-dynamic-subset.css"
          rel="stylesheet"
        />
      </head>
      <body className="font-pretendard">
        <SidebarProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </SidebarProvider>
      </body>
    </html>
  )
}
