"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import Button from "@/components/ui/button"
import { usePrivy } from "@privy-io/react-auth"
import { parseEther } from "viem"

interface SendModalProps {
  onClose: () => void
}

export default function SendModal({ onClose }: SendModalProps) {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [token, setToken] = useState("ETH")
  const { user, sendTransaction } = usePrivy()

  const handleConfirm = async () => {
    if (user && user.wallet && recipient && amount) {
      try {
        const tx = await sendTransaction({
          to: recipient as `0x${string}`,
          value: parseEther(amount),
        })
        console.log("Transaction sent:", tx)
        onClose()
      } catch (error) {
        console.error("Transaction failed:", error)
      }
    } else {
      onClose()
    }
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
            <h2 className="text-xl font-bold text-foreground">Send Token</h2>
            <button onClick={onClose} className="p-2 hover:bg-secondary/30 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Recipient Address</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f42bE"
                className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Token</label>
                <select
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors"
                >
                  <option>ETH</option>
                  <option>USDC</option>
                  <option>USDT</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>

            <div className="bg-secondary/20 rounded-lg p-4 border border-secondary/30">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gas Fees</span>
                <span className="text-sm font-semibold text-foreground">Sponsored by Kivo</span>
              </div>
            </div>

            <Button
              onClick={handleConfirm}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all"
            >
              Confirm Send
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
