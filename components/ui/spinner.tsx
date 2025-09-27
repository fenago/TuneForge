"use client"

import * as React from "react"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "gradient"
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", variant = "default", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-6 h-6", 
      lg: "w-8 h-8"
    }

    const variantClasses = {
      default: "border-tuneforge-blue-violet",
      gradient: "border-transparent bg-tuneforge-gradient"
    }

    if (variant === "gradient") {
      return (
        <div
          ref={ref}
          className={`${sizeClasses[size]} rounded-full animate-spin ${className}`}
          style={{
            background: "conic-gradient(from 0deg, #8A2BE2, #4B0082, #483D8B, #6A5ACD, #7B68EE, #9370DB, #8A2BE2)",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), white 0)",
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 2px), white 0)"
          }}
          {...props}
        />
      )
    }

    return (
      <div
        ref={ref}
        className={`${sizeClasses[size]} border-2 border-gray-200 border-t-tuneforge-blue-violet rounded-full animate-spin ${className}`}
        {...props}
      />
    )
  }
)
Spinner.displayName = "Spinner"

export { Spinner }
