"use client"

import { motion } from "framer-motion"
import { Mail, Github } from "lucide-react"
import { Button } from "./ui/button"

interface LoginScreenProps {
  onAuthSuccess: () => void
}

export default function LoginScreen({ onAuthSuccess }: LoginScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-secondary/10 px-4"
    >
      <div className="text-center space-y-8 max-w-md w-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-3"
        >
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-primary-foreground">K</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Kivo</h1>
          <p className="text-lg text-muted-foreground">Sign in securely</p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-sm text-muted-foreground leading-relaxed"
        >
          No seed phrase required. Account Abstraction powers your wallet.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-3"
        >
          <Button
            onClick={onAuthSuccess}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <Mail size={18} />
            <span>Continue with Email</span>
          </Button>

          <Button
            onClick={onAuthSuccess}
            className="w-full bg-card hover:bg-card/80 text-foreground border border-border font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Github size={18} />
            <span>Continue with GitHub</span>
          </Button>

          <Button
            onClick={onAuthSuccess}
            className="w-full bg-card hover:bg-card/80 text-foreground border border-border font-semibold py-3 rounded-xl transition-all duration-300"
          >
            Continue with Google
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="pt-4 text-xs text-muted-foreground"
        >
          <p>Your security is our priority. Powered by Privy.</p>
        </motion.div>
      </div>
    </motion.div>
  )
}
