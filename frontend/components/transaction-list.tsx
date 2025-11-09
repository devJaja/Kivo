"use client"

import { motion } from "framer-motion"
import { ArrowUpRight, ArrowDownLeft, Loader2, CheckCircle } from "lucide-react"

interface Transaction {
  id: string
  type: "send" | "receive"
  address: string
  amount: string
  status: "success" | "pending"
  timestamp: string
}

export default function TransactionList() {
  const transactions: Transaction[] = [
    {
      id: "1",
      type: "send",
      address: "0x742d...42bE",
      amount: "2.5 ETH",
      status: "success",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      type: "receive",
      address: "0x123a...789c",
      amount: "5.0 ETH",
      status: "success",
      timestamp: "1 day ago",
    },
    {
      id: "3",
      type: "send",
      address: "0xabc1...def2",
      amount: "0.75 ETH",
      status: "pending",
      timestamp: "pending",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="space-y-2"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">Recent Transactions</h3>
      <div className="space-y-2">
        {transactions.map((tx) => (
          <motion.div
            key={tx.id}
            whileHover={{ backgroundColor: "rgba(0, 147, 175, 0.05)" }}
            className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:border-primary/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${tx.type === "send" ? "bg-destructive/10" : "bg-primary/10"}`}>
                {tx.type === "send" ? (
                  <ArrowUpRight size={18} className="text-destructive" />
                ) : (
                  <ArrowDownLeft size={18} className="text-primary" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {tx.type === "send" ? "Sent to" : "Received from"}
                </p>
                <p className="text-xs text-muted-foreground font-mono">{tx.address}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{tx.amount}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {tx.status === "pending" ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Pending</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={12} className="text-primary" />
                    <span>{tx.timestamp}</span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
