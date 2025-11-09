"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Copy, Download } from "lucide-react"
import Button from "@/components/ui/button"

interface ReceiveModalProps {
  onClose: () => void
}

export default function ReceiveModal({ onClose }: ReceiveModalProps) {
  const [copied, setCopied] = useState(false)
  const address = "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE"

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
            <h2 className="text-xl font-bold text-foreground">Receive Token</h2>
            <button onClick={onClose} className="p-2 hover:bg-secondary/30 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* QR Code Placeholder */}
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-gradient-to-br from-primary/10 to-secondary/20 rounded-lg border-2 border-primary/30 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">QR Code</p>
                  <p className="text-xs text-muted-foreground">(Placeholder)</p>
                </div>
              </div>
            </div>

            {/* Address Display */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Your Wallet Address</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={address}
                  readOnly
                  className="flex-1 px-4 py-3 rounded-lg bg-background border border-border text-sm font-mono outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="p-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
                >
                  <Copy size={18} />
                </button>
              </div>
              {copied && <p className="text-xs text-primary mt-2">Address copied!</p>}
            </div>

            <Button className="w-full bg-secondary/30 hover:bg-secondary/40 text-foreground border border-secondary/50 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
              <Download size={18} />
              Download QR Code
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
