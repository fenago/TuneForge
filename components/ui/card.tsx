"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = React.useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div
      ref={ref}
      className={cn(
        "group relative rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Animated border gradient */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-tuneforge-blue-violet via-tuneforge-medium-purple to-tuneforge-slate-blue opacity-20" />
      </div>
      
      {/* Mouse follow spotlight */}
      {isHovered && (
        <div
          className="absolute pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity duration-300"
          style={{
            left: mousePosition.x - 100,
            top: mousePosition.y - 100,
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(138, 43, 226, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 group-hover:transform group-hover:scale-105 transition-transform duration-300", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight group-hover:text-tuneforge-blue-violet transition-colors duration-300",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground group-hover:text-gray-600 transition-colors duration-300", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 group-hover:transform group-hover:translate-x-1 transition-transform duration-300", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 group-hover:transform group-hover:scale-105 transition-transform duration-300", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
