"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, UserPlus } from "lucide-react";
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
    },
    onError: (error) => {
      console.error("Privy login error", error);
    },
  });

  useEffect(() => {
    if (ready && authenticated && user) {
      const embeddedWallet = user.wallet;
      if (embeddedWallet) {
        const account: WalletAccount = {
          id: user.id,
          address: embeddedWallet.address,
          name: user.google?.name || user.email?.address || "User",
          email: user.google?.email || user.email?.address || "",
          avatar: undefined,
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
      className="w-full h-screen flex flex-col items-center justify-center px-4"
    >
      <div className="max-w-md w-full p-8 bg-card rounded-xl shadow-2xl space-y-8 border border-border">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBackClick}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="space-y-3 text-center"
        >
          <h2 className="text-4xl font-extrabold text-foreground leading-tight">
            Sign Up
          </h2>
          <p className="text-base text-muted-foreground">
            Create your Kivo wallet in seconds
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          <button
            onClick={login}
            className="
              w-full flex items-center justify-center gap-2 px-4 py-3
              text-lg font-semibold rounded-2xl
              bg-[#0093af] text-white shadow-md
              transform transition-all duration-200
              hover:scale-105 hover:shadow-xl
              active:scale-95 active:shadow-md
            "
          >
            <UserPlus size={24} />
            <span>Sign Up Or Log In</span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="pt-4 text-center text-xs text-muted-foreground space-y-2"
        >
          <p>
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>
          </p>
          <p className="font-medium">
            Your account is secured with Account Abstraction.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
