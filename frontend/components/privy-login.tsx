"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import WaterButton from "@/components/water-button";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useWalletStore } from "@/store/wallet-store";
import type { WalletAccount } from "@/store/wallet-store";

interface PrivyLoginProps {
  onBackClick: () => void;
  onAuthSuccess: (account: WalletAccount) => void;
}

export default function PrivyLogin({
  onBackClick,
  onAuthSuccess,
}: PrivyLoginProps) {
  const [emailInput, setEmailInput] = useState("");
  const { user, ready, authenticated } = usePrivy();

  const { login } = useLogin({
    onComplete: ({ user, isNewUser, wasAlreadyAuthenticated, loginMethod, loginAccount }) => {
      console.log("Privy login complete", {
        user,
        isNewUser,
        wasAlreadyAuthenticated,
        loginMethod,
        loginAccount,
      });
      // The useEffect below will handle the redirect
    },
    onError: (error) => {
      console.error("Privy login error", error);
    },
  });

  useEffect(() => {
    if (ready && authenticated && user) {
      const embeddedWallet = user.wallets?.find(
        (w) => w.walletClientType === "privy"
      );
      if (embeddedWallet) {
        const account: WalletAccount = {
          id: user.id,
          address: embeddedWallet.address,
          name:
            user.google?.name ||
            user.twitter?.username ||
            user.email?.address ||
            "User",
          email: user.google?.email || user.email?.address || "",
          avatar:
            user.google?.profilePictureUrl || user.twitter?.profilePictureUrl,
          firstLoginTime: user.createdAt
            ? new Date(user.createdAt).getTime()
            : Date.now(),
        };
        onAuthSuccess(account);
      }
    }
  }, [ready, authenticated, user, onAuthSuccess]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-secondary/5 px-4"
    >
      <div className="max-w-md w-full space-y-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBackClick}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Back</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="space-y-2"
        >
          <h2 className="text-3xl font-bold text-foreground">Sign Up</h2>
          <p className="text-sm text-muted-foreground">
            Create your Kivo wallet in seconds
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-3"
        >
          <WaterButton
            onClick={login}
            variant="secondary"
            size="md"
            className="w-full"
          >
            <span>Continue with Socials</span>
          </WaterButton>
        </motion.div>

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
  );
}
