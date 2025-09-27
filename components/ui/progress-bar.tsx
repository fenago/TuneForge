"use client"

import * as React from "react"

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showLabel?: boolean
  variant?: "default" | "gradient"
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, max = 100, showLabel = false, variant = "default", ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const barVariants = {
      default: "bg-tuneforge-blue-violet",
      gradient: "bg-tuneforge-gradient"
    }

    return (
      <div ref={ref} className={`w-full ${className}`} {...props}>
        {showLabel && (
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        )}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${barVariants[variant]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)
ProgressBar.displayName = "ProgressBar"

export { ProgressBar }
