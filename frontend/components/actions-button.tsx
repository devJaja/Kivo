"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Send, ArrowDownLeft, Shuffle, ArrowRightLeft } from "lucide-react"
import { useWalletStore } from "@/store/wallet-store"

interface ActionButtonProps {
  icon: React.ElementType
  label: string
  onClick: () => void
  disabled?: boolean
}

const ActionButton = ({ icon: Icon, label, onClick, disabled }: ActionButtonProps) => {
  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return
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

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={(e) => {
        if (disabled) return
        createRipple(e)
        onClick()
      }}
      className={`flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-xl bg-card border border-border transition-all duration-300 group ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/30 hover:bg-secondary/10"
      }`}
      disabled={disabled}
    >
      <div
        className={`p-2.5 rounded-lg transition-colors ${
          disabled ? "bg-gray-500" : "bg-primary/10 group-hover:bg-primary/20"
        }`}
      >
        <Icon size={24} className={disabled ? "text-white" : "text-primary"} />
      </div>
      <span className="text-xs font-semibold text-foreground">{label}</span>
    </motion.button>
  )
}

interface ActionButtonsProps {
  onSend: () => void
  onReceive: () => void
  onSwap: () => void
  onBridge: () => void
}

export default function ActionButtons({ onSend, onReceive, onSwap, onBridge }: ActionButtonsProps) {
  const { balancesLoading } = useWalletStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="grid grid-cols-4 gap-3"
    >
      <ActionButton icon={Send} label="Send" onClick={onSend} disabled={balancesLoading} />
      <ActionButton icon={ArrowDownLeft} label="Receive" onClick={onReceive} />
      <ActionButton icon={Shuffle} label="Swap" onClick={onSwap} />
      <ActionButton icon={ArrowRightLeft} label="Bridge" onClick={onBridge} />
    </motion.div>
  )
}
