"use client"

import type React from "react"
import { useRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface WaterButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: "primary" | "secondary" | "icon"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  type?: "button" | "submit"
}

export default function WaterButton({
  children,
  onClick,
  className,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
}: WaterButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return

    const button = buttonRef.current
    if (!button) return

    // Create ripple effect
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ripple = document.createElement("span")
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    ripple.classList.add("ripple")
    button.appendChild(ripple)

    setTimeout(() => ripple.remove(), 600)

    onClick?.()
  }

  const baseClasses =
    "relative overflow-hidden font-semibold transition-all duration-300 flex items-center justify-center gap-2 rounded-lg border border-border"

  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    icon: "bg-transparent text-foreground hover:bg-muted rounded-full",
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  }

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        "hover:shadow-lg hover:scale-105 active:scale-95",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <style>{`
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          width: 10px;
          height: 10px;
          animation: ripple-animation 0.6s ease-out;
          pointer-events: none;
        }
        
        @keyframes ripple-animation {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        {children}
      </motion.div>
    </button>
  )
}
