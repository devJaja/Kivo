"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, ArrowLeft } from "lucide-react"
import WaterButton from "@/components/water-button"
import { usePrivyAuth } from "@/hooks/use-wallet"
import { useWalletStore } from "@/store/wallet-store"
import type { WalletAccount } from "@/store/wallet-store"

interface PrivyLoginProps {
  onBackClick: () => void
  onAuthSuccess: (account: WalletAccount) => void
}

export default function PrivyLogin({ onBackClick, onAuthSuccess }: PrivyLoginProps) {
  const [emailInput, setEmailInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeMethod, setActiveMethod] = useState<string | null>(null)

  const { loginWithGoogle, loginWithTwitter, loginWithEmail } = usePrivyAuth()
  const { setAccount, setAuthenticated } = useWalletStore()

  const handleLogin = async (method: "google" | "twitter" | "email") => {
    setIsLoading(true)
    setActiveMethod(method)

    try {
      let user
      if (method === "google") {
        user = await loginWithGoogle()
      } else if (method === "twitter") {
        user = await loginWithTwitter()
      } else {
        user = await loginWithEmail(emailInput || "user@example.com")
      }

      const account: WalletAccount = {
        id: user.id,
        address: user.walletAddress || `0x${Math.random().toString(16).slice(2, 42)}`,
        name: user.name || "User",
        email: user.email || "",
        avatar: user.avatar,
        firstLoginTime: Date.now(),
      }

      setAccount(account)
      setAuthenticated(true)
      onAuthSuccess(account)
    } catch (error) {
      console.error("[v0] Login error:", error)
    } finally {
      setIsLoading(false)
      setActiveMethod(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-secondary/5 px-4"
    >
      <div className="max-w-md w-full space-y-6">
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBackClick}
          disabled={isLoading}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Back</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="space-y-2"
        >
          <h2 className="text-3xl font-bold text-foreground">Sign Up</h2>
          <p className="text-sm text-muted-foreground">Create your Kivo wallet in seconds</p>
        </motion.div>

        {/* Social Login Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-3"
        >
          <WaterButton
            onClick={() => handleLogin("google")}
            disabled={isLoading}
            variant="secondary"
            size="md"
            className="w-full"
          >
            {activeMethod === "google" && isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  className="inline-block"
                >
                  ⊙
                </motion.div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span>🔵</span>
                <span>Continue with Google</span>
              </>
            )}
          </WaterButton>

          <WaterButton
            onClick={() => handleLogin("twitter")}
            disabled={isLoading}
            variant="secondary"
            size="md"
            className="w-full"
          >
            {activeMethod === "twitter" && isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  className="inline-block"
                >
                  ⊙
                </motion.div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span>𝕏</span>
                <span>Continue with X</span>
              </>
            )}
          </WaterButton>

          <WaterButton
            onClick={() => handleLogin("email")}
            disabled={isLoading}
            variant="secondary"
            size="md"
            className="w-full"
          >
            {activeMethod === "email" && isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  className="inline-block"
                >
                  ⊙
                </motion.div>
                <span>Signing up...</span>
              </>
            ) : (
              <>
                <Mail size={18} />
                <span>Continue with Email</span>
              </>
            )}
          </WaterButton>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </motion.div>

        {/* Email Input (optional secondary method) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-foreground">Email Address</label>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="you@example.com"
            disabled={isLoading}
            className="w-full px-4 py-2.5 bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
          />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="pt-4 text-center text-xs text-muted-foreground space-y-1"
        >
          <p>By continuing, you agree to our Terms of Service</p>
          <p>Your account is secured with Account Abstraction.</p>
        </motion.div>
      </div>
    </motion.div>
  )
}
