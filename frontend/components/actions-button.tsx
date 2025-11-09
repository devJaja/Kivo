"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Send, ArrowDownLeft, Shuffle } from "lucide-react"

interface ActionButtonsProps {
  onSend: () => void
  onReceive: () => void
  onSwap: () => void
}

export default function ActionButtons({ onSend, onReceive, onSwap }: ActionButtonsProps) {
  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    const ripple = document.createElement("span")
    ripple.style.width = ripple.style.height = size + "px"
    ripple.style.left = x + "px"
    ripple.style.top = y + "px"
    ripple.style.position = "absolute"
    ripple.style.borderRadius = "50%"
    ripple.style.backgroundColor = "rgba(255, 255, 255, 0.6)"
    ripple.style.pointerEvents = "none"
    ripple.style.animation = "ripple 0.6s ease-out"
    button.style.position = "relative"
    button.style.overflow = "hidden"
    button.appendChild(ripple)

    setTimeout(() => ripple.remove(), 600)
  }

  const ActionButton = ({
    icon: Icon,
    label,
    onClick,
  }: {
    icon: any
    label: string
    onClick: () => void
  }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        createRipple(e as any)
        onClick()
      }}
      className="flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-secondary/10 transition-all duration-300 group"
    >
      <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
        <Icon size={24} className="text-primary" />
      </div>
      <span className="text-xs font-semibold text-foreground">{label}</span>
    </motion.button>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="grid grid-cols-3 gap-3"
    >
      <ActionButton icon={Send} label="Send" onClick={onSend} />
      <ActionButton icon={ArrowDownLeft} label="Receive" onClick={onReceive} />
      <ActionButton icon={Shuffle} label="Swap" onClick={onSwap} />
    </motion.div>
  )
}
