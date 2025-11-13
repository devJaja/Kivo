"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import HeroWelcome from "@/components/hero-welcome";
import PrivyLogin from "@/components/privy-login";
import Dashboard from "@/components/dashboard";
import { useWalletStore } from "@/store/wallet-store";
import type { WalletAccount } from "@/store/wallet-store";
import { usePrivy } from "@privy-io/react-auth";

type AppState = "welcome" | "signup" | "dashboard";

export default function Home() {
  const { setAccount, setAuthenticated } = useWalletStore();
  const { authenticated, user, ready } = usePrivy();

  const [appState, setAppState] = useState<AppState>("welcome");

  useEffect(() => {
    if (ready) {
      if (authenticated && user) {
        const embeddedWallet = user.wallet;
        if (embeddedWallet) {
          const account: WalletAccount = {
            id: user.id,
            address: embeddedWallet.address,
            name: user.google?.name || user.twitter?.username || user.email?.address || "User",
            email: user.google?.email || user.email?.address || "",
            avatar: user.twitter?.profilePictureUrl || "",
            firstLoginTime: user.createdAt ? new Date(user.createdAt).getTime() : Date.now(),
          };
          setAccount(account);
          setAuthenticated(true);
          setTimeout(() => setAppState("dashboard"), 0);
        } else {
          // User is authenticated but no embedded wallet found, maybe show a message or redirect to wallet creation
          setTimeout(() => setAppState("signup"), 0);
        }
      } else {
        setTimeout(() => setAppState("welcome"), 0);
      }
    }
  }, [ready, authenticated, user, setAccount, setAuthenticated]);

  const handleGetStarted = () => {
    setAppState("signup");
  };

  const handleAuthSuccess = (account: WalletAccount) => {
    setAccount(account);
    setAuthenticated(true);
    setAppState("dashboard");
  };

  const handleBackClick = () => {
    setAppState("welcome");
  };

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
  );
}
