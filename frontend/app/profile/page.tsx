"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Edit2, Save, Mail, Wallet, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWalletStore } from "@/store/wallet-store"
import WaterButton from "@/components/water-button"
import TransactionList from "@/components/transaction-list"

export default function ProfilePage() {
  const router = useRouter()
  const { account, updateSettings, settings, transactions } = useWalletStore()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(account?.name || "")

  console.log("Rendering ProfilePage, transactions:", transactions);

  if (!account) {
    return null
  }

  const handleSave = () => {
    updateSettings({ displayName })
    setIsEditing(false)
  }

  const loginDate = new Date(account.firstLoginTime).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const shortAddress = account.address?.slice(0, 10) + "..." + account.address?.slice(-8)

  // Calculate transaction stats
  const totalTxs = transactions.length
  const receivedTxs = transactions.filter((tx) => tx.type === "receive").length
  const sentTxs = transactions.filter((tx) => tx.type === "send").length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-screen flex flex-col bg-background overflow-y-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-4 py-6 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10"
      >
        <div className="flex items-center justify-between max-w-md mx-auto w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </motion.button>
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
          <div className="w-10" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-6">
        {/* Avatar & Name Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold mx-auto shadow-lg">
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

          {/* Display Name Edit */}
          <div className="space-y-2">
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-card text-foreground border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Save size={18} />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="space-y-3"
        >
          {/* Email */}
          <div className="p-4 bg-card border border-border rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail size={16} />
              <span className="text-sm font-medium">Email</span>
            </div>
            <p className="text-foreground ml-8 break-all">{account.email}</p>
          </div>

          {/* Wallet Address */}
          <div className="p-4 bg-card border border-border rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet size={16} />
              <span className="text-sm font-medium">Wallet Address</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                navigator.clipboard.writeText(account.address)
              }}
              className="ml-8 font-mono text-sm text-primary hover:text-primary/80 transition-colors"
            >
              {shortAddress}
            </motion.button>
          </div>

          {/* Join Date */}
          <div className="p-4 bg-card border border-border rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={16} />
              <span className="text-sm font-medium">Joined</span>
            </div>
            <p className="text-foreground ml-8">{loginDate}</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="grid grid-cols-3 gap-3 pt-4"
        >
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-center space-y-1">
            <p className="text-2xl font-bold text-primary">{totalTxs}</p>
            <p className="text-xs text-muted-foreground">Total Txs</p>
          </div>
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-center space-y-1">
            <p className="text-2xl font-bold text-primary">{receivedTxs}</p>
            <p className="text-xs text-muted-foreground">Received</p>
          </div>
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-center space-y-1">
            <p className="text-2xl font-bold text-primary">{sentTxs}</p>
            <p className="text-xs text-muted-foreground">Sent</p>
          </div>
        </motion.div>

        {/* Transaction List */}
        <TransactionList />

        {/* Account Recovery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="p-4 bg-card border border-border rounded-lg space-y-3"
        >
          <h3 className="font-semibold text-foreground">Account Security</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your Kivo account is secured with Account Abstraction. No seed phrases to lose. If you need to recover your
            account, use the recovery option linked to your Privy account.
          </p>
          <WaterButton
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => {
              // TODO: Open recovery modal with detailed AA recovery instructions
              alert("[v0] Recovery flow: Would open modal explaining AA account recovery via Privy")
            }}
          >
            Recovery Options
          </WaterButton>
        </motion.div>
      </div>
    </motion.div>
  )
}
