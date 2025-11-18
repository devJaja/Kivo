"use client"

import { motion } from "framer-motion"
import { useWalletStore } from "@/store/wallet-store"
import TransactionItem from "./transaction-item"

export default function TransactionList() {
  const { transactions } = useWalletStore()

  const sortedTransactions = [...transactions].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="space-y-2"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">Recent Transactions</h3>
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
          </div>
        ) : (
          sortedTransactions.map((tx) => <TransactionItem key={tx.id} tx={tx} />)
        )}
      </div>
    </motion.div>
  )
}
