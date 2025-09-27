"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"

interface AnimatedCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: React.ReactNode
  delay?: number
  direction?: "up" | "down" | "left" | "right"
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, children, delay = 0, direction = "up", ...props }, ref) => {
    const directionOffset = {
      up: { y: 50 },
      down: { y: -50 },
      left: { x: 50 },
      right: { x: -50 },
    }

    return (
      <motion.div
        ref={ref}
        initial={{ 
          opacity: 0, 
          ...directionOffset[direction] 
        }}
        whileInView={{ 
          opacity: 1, 
          x: 0, 
          y: 0 
        }}
        transition={{ 
          duration: 0.6, 
          delay,
          ease: "easeOut" 
        }}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
        className={`rounded-lg border border-gray-200 bg-white p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
AnimatedCard.displayName = "AnimatedCard"

export { AnimatedCard }
