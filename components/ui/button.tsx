"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-tuneforge-gradient text-white hover:bg-tuneforge-gradient-reverse hover:shadow-xl hover:scale-105 active:scale-95",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg hover:scale-105",
        outline:
          "border-2 border-tuneforge-blue-violet text-tuneforge-blue-violet hover:bg-tuneforge-blue-violet hover:text-white hover:shadow-lg hover:scale-105 hover:border-tuneforge-medium-purple",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md hover:scale-105",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-105",
        link: "text-primary underline-offset-4 hover:underline hover:scale-105",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Array<{
      id: number
      x: number
      y: number
      size: number
    }>>([])

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget
      const rect = button.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const size = Math.max(rect.width, rect.height)

      const newRipple = {
        id: Date.now(),
        x,
        y,
        size,
      }

      setRipples(prev => [...prev, newRipple])

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
      }, 600)

      // Call original onClick if provided
      if (props.onClick) {
        props.onClick(event)
      }
    }

    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        onClick={handleClick}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/20 to-transparent w-0 group-hover:w-full transition-all duration-700 skew-x-12 group-hover:animate-shimmer" />
        
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 animate-ping"
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        ))}
        
        {/* Content with subtle animation */}
        <span className="relative z-10 group-hover:animate-pulse">
          {children}
        </span>
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
