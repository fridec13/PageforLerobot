"use client"

import Link from "next/link"
import { Cpu, Github, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export function Header({ isMobileOpen, setIsMobileOpen }: HeaderProps) {
  return (
    <header className="bg-card border-b py-3 px-4 md:px-6 flex justify-between items-center sticky top-0 z-20 shadow-sm">
      <div className="flex items-center space-x-3">
        <Link href="/" className="font-bold text-xl flex items-center hover:opacity-90 transition-opacity">
          <div className="bg-blue-500 text-white rounded-lg p-2 mr-3">
            <Cpu className="h-6 w-6" />
          </div>
          <span className="text-foreground">Robot Offset Simulator</span>
        </Link>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Github className="h-4 w-4" />
            <span className="hidden md:inline">GitHub</span>
          </a>
        </Button>
        
        <Button variant="ghost" size="sm" asChild>
          <Link href="/robocon/offsetsim" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">시뮬레이터</span>
          </Link>
        </Button>
      </div>
    </header>
  )
} 