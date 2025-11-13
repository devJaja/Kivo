"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import WalletCard from "@/components/wallet-card";
import ActionButtons from "./actions-button";
import TransactionList from "@/components/transaction-list";
import SendModal from "@/components/modals/send-modal";
import ReceiveModal from "@/components/modals/receive-modal";
import SwapModal from "@/components/modals/swap-modal";
import BridgeModal from "@/components/modals/bridge-modal";
import ConfirmationModal from "@/components/modals/confirmation-modal";
import AIAssistant from "@/components/ai-assistant";
import ChainSelector from "@/components/chain-selector";
import ProfileIcon from "@/components/profile-icon";
import { usePrivy } from "@privy-io/react-auth";
import { useBalance, useAccount } from "wagmi";
import { useWalletStore } from "@/store/wallet-store";
import { LogOut } from "lucide-react";
import { wagmiConfig } from "@/app/providers";

// 👇 Inline wallet interface to avoid types/privy.d.ts
interface ExtendedWallet {
  address: string;
  chainId?: string;
}

type ModalType = "send" | "receive" | "swap" | "bridge" | null;

export default function Dashboard() {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { user, logout } = usePrivy();
  const wallet = user?.wallet as ExtendedWallet | undefined;
  const { account, setAccount, setAuthenticated } = useWalletStore();
  const { address: wagmiAddress, chainId } = useAccount();

  // Get the embedded wallet from Privy
  const embeddedWallet = user?.wallet;
  
  // Use embeddedWallet address or fallback to wagmi address or user wallet
  const activeAddress = embeddedWallet?.address || wagmiAddress || wallet?.address;
  
  // Parse chainId properly - Privy returns chainId as "eip155:84532" format
    const activeChainId = chainId || 84532; // Default to Base Sepolia
  const { data: balanceData, isLoading, error, refetch } = useBalance({
    address: activeAddress as `0x${string}`,
    chainId: activeChainId,
    query: {
      enabled: !!activeAddress,
      refetchInterval: 10000, // Refetch every 10 seconds
      staleTime: 5000, // Consider data stale after 5 seconds
    },
  });

  // Debug logs to help troubleshoot
  useEffect(() => {
    console.log('🔍 Balance Debug Info:', {
      activeAddress,
      activeChainId,
      embeddedWallet: embeddedWallet?.address,
      wagmiAddress,
      chainId,
      balanceData: balanceData?.formatted,
      isLoading,
      error: error?.message,
    });
  }, [activeAddress, activeChainId, balanceData, isLoading, error, embeddedWallet, wagmiAddress, chainId]);

  useEffect(() => {
    if (balanceData) {
      console.log('✅ Balance loaded:', balanceData.formatted);
      // Future: Load balances from relayer or backend
    }
  }, [balanceData]);

  // Refetch balance when chain changes
  useEffect(() => {
    if (activeAddress && activeChainId) {
      refetch();
    }
  }, [activeChainId, activeAddress, refetch]);

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = async () => {
    await logout();
    setAccount(null);
    setAuthenticated(false);
    router.push("/");
    setShowLogoutConfirm(false);
  };

  const handleCancelLogout = () => setShowLogoutConfirm(false);

  const handleProfileClick = () => router.push("/profile");

  // Show loading or error states
  const ethBalance = isLoading 
    ? "..." 
    : error 
    ? "0" 
    : balanceData?.formatted || "0";
    
  const chainName =
    wagmiConfig.chains.find((c) => c.id === activeChainId)?.name || "Base Sepolia";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full h-screen bg-background overflow-hidden flex flex-col"
    >
      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="px-4 py-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-20"
      >
        <div className="flex items-center justify-between max-w-md mx-auto w-full">
          <ChainSelector />
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleProfileClick}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              ⚙️
            </motion.button>
            <ProfileIcon onLogout={handleLogout} />
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 overflow-y-auto"
      >
        <div className="px-4 py-6 max-w-md mx-auto space-y-6 pb-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="space-y-2"
          >
            <p className="text-sm text-muted-foreground">
              Welcome back, {account?.name?.split(" ")[0]}
            </p>
            <h1 className="text-3xl font-bold text-foreground">Your Wallet</h1>
          </motion.div>

          {/* Wallet Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <WalletCard
              balance={ethBalance}
              chain={chainName}
              address={account?.address || activeAddress || ""}
            />
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <ActionButtons
              onSend={() => setActiveModal("send")}
              onReceive={() => setActiveModal("receive")}
              onSwap={() => setActiveModal("swap")}
              onBridge={() => setActiveModal("bridge")}
            />
          </motion.div>

          {/* Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <TransactionList />
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="grid grid-cols-2 gap-3 pt-4"
          >
            <FeatureCard icon="🔐" title="No Seed Phrases" />
            <FeatureCard icon="⛽" title="Gasless Tx" />
            <FeatureCard icon="🤖" title="AI Powered" />
            <FeatureCard icon="🌉" title="Multi-Chain" />
          </motion.div>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === "send" && <SendModal onClose={() => setActiveModal(null)} />}
        {activeModal === "receive" && <ReceiveModal onClose={() => setActiveModal(null)} />}
        {activeModal === "swap" && <SwapModal onClose={() => setActiveModal(null)} />}
        {activeModal === "bridge" && <BridgeModal onClose={() => setActiveModal(null)} />}
        {showLogoutConfirm && (
          <ConfirmationModal
            title="Confirm Logout"
            description="Are you sure you want to log out of your Kivo wallet?"
            icon={<LogOut size={32} />}
            onConfirm={confirmLogout}
            onCancel={handleCancelLogout}
            confirmText="Log Out"
          />
        )}
      </AnimatePresence>

      {/* AI Assistant */}
      <AIAssistant />
    </motion.div>
  );
}

function FeatureCard({ icon, title }: { icon: string; title: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-card border border-border rounded-lg p-3 text-center hover:border-primary/30 transition-colors"
    >
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-xs font-semibold text-foreground">{title}</p>
    </motion.div>
  );
}