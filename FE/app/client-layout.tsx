"use client"

import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Providers } from './providers'
import { useState } from 'react'

export function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <Providers>
      <div className="flex flex-col h-screen overflow-hidden">
        <Header isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
          <main className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </Providers>
  )
} 