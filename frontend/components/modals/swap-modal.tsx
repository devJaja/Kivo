"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, ArrowRightLeft } from "lucide-react"
import Button from "@/components/ui/button"

interface SwapModalProps {
  onClose: () => void
}

export default function SwapModal({ onClose }: SwapModalProps) {
  const [fromToken, setFromToken] = useState("ETH")
  const [toToken, setToToken] = useState("USDC")
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")

  const handleSwap = () => {
    // Handle swap logic
    onClose()
  }

  const swapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-40"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 max-w-md mx-auto"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Swap Tokens</h2>
            <button onClick={onClose} className="p-2 hover:bg-secondary/30 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* From Token */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">From</label>
              <div className="flex gap-2">
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="w-24 px-3 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none"
                >
                  <option>ETH</option>
                  <option>USDC</option>
                  <option>DAI</option>
                </select>
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 px-4 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={swapTokens}
                className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <ArrowRightLeft size={20} className="text-primary" />
              </motion.button>
            </div>

            {/* To Token */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">To</label>
              <div className="flex gap-2">
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  className="w-24 px-3 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none"
                >
                  <option>USDC</option>
                  <option>ETH</option>
                  <option>DAI</option>
                </select>
                <input
                  type="number"
                  value={toAmount}
                  readOnly
                  placeholder="0.00"
                  className="flex-1 px-4 py-3 rounded-lg bg-background border border-border outline-none text-muted-foreground"
                />
              </div>
            </div>

            {/* Exchange Rate */}
            <div className="bg-secondary/20 rounded-lg p-3 border border-secondary/30">
              <p className="text-xs text-muted-foreground">
                1 {fromToken} ≈ 2,450.50 {toToken}
              </p>
            </div>

            <Button
              onClick={handleSwap}
              disabled={!fromAmount}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold py-3 rounded-lg transition-all"
            >
              Confirm Swap
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
