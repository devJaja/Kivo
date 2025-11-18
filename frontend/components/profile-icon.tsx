"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LogOut, Copy, Check } from "lucide-react"
import { useWalletStore } from "@/store/wallet-store"

interface ProfileIconProps {
  onLogout?: () => void
}

export default function ProfileIcon({ onLogout }: ProfileIconProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { account, transactions } = useWalletStore()

  if (!account) return null

  const handleCopyAddress = () => {
    if (account.address) {
      navigator.clipboard.writeText(account.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shortAddress = account.address?.slice(0, 6) + "..." + account.address?.slice(-4)

  // Calculate transaction stats
  const totalTxs = transactions.length
  const receivedTxs = transactions.filter((tx) => tx.type === "receive").length
  const sentTxs = transactions.filter((tx) => tx.type === "send").length

  return (
    <div className="relative">
      {/* Profile Icon Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md"
      >
        {account.avatar ? (
          <img
            src={account.avatar || "/placeholder.svg"}
            alt={account.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          account.name?.charAt(0).toUpperCase()
        )}
      </motion.button>

      {/* Profile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  {account.avatar ? (
                    <img
                      src={account.avatar || "/placeholder.svg"}
                      alt={account.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    account.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{account.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{account.email}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Address */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Wallet Address</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCopyAddress}
                  className="w-full p-2.5 bg-muted rounded-lg text-xs text-foreground font-mono flex items-center justify-between hover:bg-muted/80 transition-colors"
                >
                  <span>{shortAddress}</span>
                  {copied ? (
                    <Check size={14} className="text-primary" />
                  ) : (
                    <Copy size={14} className="text-muted-foreground" />
                  )}
                </motion.button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">{totalTxs}</p>
                  <p className="text-xs text-muted-foreground">Total Txs</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">{receivedTxs}</p>
                  <p className="text-xs text-muted-foreground">Received</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">{sentTxs}</p>
                  <p className="text-xs text-muted-foreground">Sent</p>
                </div>
              </div>
            </div>

            {/* Logout */}
            <div className="p-4 border-t border-border">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsOpen(false)
                  onLogout?.()
                }}
                className="w-full px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40"
        />
      )}
    </div>
  )
}
