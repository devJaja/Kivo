"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Copy, Eye, EyeOff } from "lucide-react"

interface WalletCardProps {
  balance: string
  chain: string
  address: string
}

export default function WalletCard({ balance, chain, address }: WalletCardProps) {
  const [displayBalance, setDisplayBalance] = useState("0")
  const [showBalance, setShowBalance] = useState(true)
  const [copied, setCopied] = useState(false)

  // Animate balance counter
  useEffect(() => {
    const numBalance = Number.parseFloat(balance)
    let current = 0
    const increment = numBalance / 50

    const timer = setInterval(() => {
      current += increment
      if (current >= numBalance) {
        setDisplayBalance(numBalance.toFixed(4))
        clearInterval(timer)
      } else {
        setDisplayBalance(current.toFixed(4))
      }
    }, 10)

    return () => clearInterval(timer)
  }, [balance])

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const chainIcons: Record<string, string> = {
    base: "⚪",
    ethereum: "◆",
    polygon: "🟣",
    optimism: "🔴",
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-5)}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-card to-secondary/20 border border-primary/20 p-6 shadow-lg"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 space-y-6">
        {/* Top Section */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Total Balance</p>
            <div className="flex items-baseline gap-2">
              {showBalance ? (
                <motion.p
                  key="visible"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-3xl font-bold text-foreground font-mono"
                >
                  {displayBalance}
                </motion.p>
              ) : (
                <p className="text-3xl font-bold text-foreground">••••••</p>
              )}
              <span className="text-sm text-muted-foreground">ETH</span>
            </div>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 hover:bg-secondary/30 rounded-lg transition-colors"
          >
            {showBalance ? (
              <Eye size={20} className="text-muted-foreground" />
            ) : (
              <EyeOff size={20} className="text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Chain & Address Section */}
        <div className="flex items-center justify-between pt-4 border-t border-primary/10">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="text-2xl"
            >
              {chainIcons[chain] || "⚪"}
            </motion.div>
            <div>
              <p className="text-xs text-muted-foreground">Active Chain</p>
              <p className="text-sm font-semibold text-foreground capitalize">{chain}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <p className="text-xs text-muted-foreground font-mono">{formatAddress(address)}</p>
            <button onClick={handleCopy} className="p-1.5 hover:bg-secondary/30 rounded-lg transition-colors">
              <Copy size={16} className={`transition-colors ${copied ? "text-primary" : "text-muted-foreground"}`} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
