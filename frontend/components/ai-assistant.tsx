"use client"

import { motion } from "framer-motion"
import { MessageCircle } from "lucide-react"
import { useState } from "react"

export default function AIAssistant() {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="fixed bottom-6 right-6 z-30"
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="relative p-4 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
        style={{
          animation: "float-pulse 2s ease-in-out infinite",
        }}
      >
        <MessageCircle size={24} />
      </motion.button>

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: showTooltip ? 1 : 0,
          scale: showTooltip ? 1 : 0.8,
        }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-full right-0 mb-3 bg-card border border-border rounded-lg px-4 py-2 text-sm font-semibold text-foreground whitespace-nowrap shadow-lg pointer-events-none"
      >
        Ask Kivo AI (Coming Soon)
      </motion.div>
    </motion.div>
  )
}
