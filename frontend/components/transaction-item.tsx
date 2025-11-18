"use client"

import { motion } from "framer-motion"
import { ArrowUpRight, ArrowDownLeft, Loader2, CheckCircle } from "lucide-react"
import { formatEther } from "viem"
import { Transaction } from "@/store/wallet-store"

function timeAgo(timestamp: number): string {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - timestamp) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) {
    return Math.floor(interval) + " years ago"
  }
  interval = seconds / 2592000
  if (interval > 1) {
    return Math.floor(interval) + " months ago"
  }
  interval = seconds / 86400
  if (interval > 1) {
    return Math.floor(interval) + " days ago"
  }
  interval = seconds / 3600
  if (interval > 1) {
    return Math.floor(interval) + " hours ago"
  }
  interval = seconds / 60
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago"
  }
  return Math.floor(seconds) + " seconds ago"
}

interface TransactionItemProps {
  tx: Transaction
}

export default function TransactionItem({ tx }: TransactionItemProps) {
  return (
    <motion.div
      whileHover={{ backgroundColor: "rgba(0, 147, 175, 0.05)" }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-card border border-border hover:border-primary/20 transition-colors"
    >
      <div className="flex items-center gap-3 mb-2 sm:mb-0">
        <div className={`p-2 rounded-lg ${tx.type === "send" ? "bg-destructive/10" : "bg-primary/10"}`}>
          {tx.type === "send" ? (
            <ArrowUpRight size={18} className="text-destructive" />
          ) : (
            <ArrowDownLeft size={18} className="text-primary" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{tx.type === "send" ? "Sent to" : "Received from"}</p>
          <p className="text-xs text-muted-foreground font-mono">{tx.type === "send" ? tx.to : tx.from}</p>
        </div>
      </div>
      <div className="text-right w-full sm:w-auto">
        <p className="text-sm font-semibold text-foreground">{`${formatEther(BigInt(tx.amount))} ETH`}</p>
        <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
          {tx.status === "pending" ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              <span>Pending</span>
            </>
          ) : (
            <>
              <CheckCircle size={12} className="text-primary" />
              <span>{timeAgo(tx.timestamp)}</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
