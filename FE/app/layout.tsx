import './globals.css'
import { ClientLayout } from '@/app/client-layout'
import { SidebarProvider } from '@/lib/contexts/SidebarContext'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Robot Offset Simulator',
    default: 'Robot Offset Simulator',
  },
  description: '3D 로봇 모델을 통한 오프셋 시뮬레이션 도구',
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
