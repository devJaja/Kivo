"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import HeroWelcome from "@/components/hero-welcome"
import PrivyLogin from "@/components/privy-login"
import Dashboard from "@/components/dashboard"
import { useWalletStore } from "@/store/wallet-store"
import type { WalletAccount } from "@/store/wallet-store"

type AppState = "welcome" | "signup" | "dashboard"

export default function Home() {
  const { isAuthenticated, setAccount, setAuthenticated } = useWalletStore()
  const [appState, setAppState] = useState<AppState>(isAuthenticated ? "dashboard" : "welcome")

  const handleGetStarted = () => {
    setAppState("signup")
  }

  const handleAuthSuccess = (account: WalletAccount) => {
    setAccount(account)
    setAuthenticated(true)
    setAppState("dashboard")
  }

  const handleBackClick = () => {
    setAppState("welcome")
  }

  return (
    <main className="w-full h-screen bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {appState === "welcome" && <HeroWelcome key="welcome" onGetStarted={handleGetStarted} />}
        {appState === "signup" && (
          <PrivyLogin key="signup" onBackClick={handleBackClick} onAuthSuccess={handleAuthSuccess} />
        )}
        {appState === "dashboard" && <Dashboard key="dashboard" />}
      </AnimatePresence>
    </main>
  )
}
