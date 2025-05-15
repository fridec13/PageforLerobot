import React from "react"
import { cn } from "@/lib/utils"

interface TerminalProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Terminal = React.forwardRef<HTMLDivElement, TerminalProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-black text-green-400 font-mono text-sm p-4 rounded-md overflow-auto",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Terminal.displayName = "Terminal"
