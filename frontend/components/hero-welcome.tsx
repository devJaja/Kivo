"use client"

import { motion } from "framer-motion"
import WaterButton from "@/components/water-button"

interface HeroWelcomeProps {
  onGetStarted: () => void
}

export default function HeroWelcome({ onGetStarted }: HeroWelcomeProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-secondary/5 px-4"
    >
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="flex justify-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/70 rounded-3xl flex items-center justify-center shadow-2xl">
            <span className="text-5xl font-black text-primary-foreground">K</span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-3"
        >
          <h1 className="text-5xl font-bold text-foreground text-balance">Kivo Smart Wallet</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Account Abstraction meets AI. No seed phrases. Pure simplicity.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="space-y-2 py-4"
        >
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="text-primary font-semibold">✓</span>
            <span className="text-foreground">No seed phrases or complex setup</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="text-primary font-semibold">✓</span>
            <span className="text-foreground">Multi-chain supported</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="text-primary font-semibold">✓</span>
            <span className="text-foreground">AI-powered recommendations</span>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <WaterButton onClick={onGetStarted} variant="primary" size="lg" className="w-full">
            Get Started
          </WaterButton>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="pt-6 text-xs text-muted-foreground space-y-2"
        >
          <p>Powered by Account Abstraction</p>
          <p>Secured by Privy</p>
        </motion.div>
      </div>
    </motion.div>
  )
}
