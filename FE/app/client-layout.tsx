"use client"

import { Header } from '@/components/layout/header'
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
      <div className="flex flex-col min-h-screen">
        <Header isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </Providers>
  )
} 