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
import EnhancedAIAssistant from "@/components/ai-assistant";
import ChainSelector from "@/components/chain-selector";
import ProfileIcon from "@/components/profile-icon";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAccount, useBalance } from "wagmi";
import { useWalletStore } from "@/store/wallet-store";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import ArbitrageScanner from "@/components/arbitrage-scanner";
import { LogOut } from "lucide-react";
import { wagmiConfig } from "@/hooks/wagmiConfig";
import { RealTimePriceOracle } from "@/lib/priceOracle";
import { getBalance } from "@wagmi/core";

import { mainnet, sepolia, baseSepolia } from 'viem/chains';

type AllowedChainId = typeof mainnet.id | typeof sepolia.id | typeof baseSepolia.id;

type ModalType = "send" | "receive" | "swap" | "bridge" | null;

export default function Dashboard() {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { user, logout } = usePrivy();
  const { wallets } = useWallets();
  const { account, setAccount, setAuthenticated, setBalances, setBalancesLoading, setActiveChain } = useWalletStore();
  const { chainId: wagmiChainId } = useAccount(); // Get chainId directly from wagmi

  console.log('Debug: Privy User =', user);
  console.log('Debug: Privy Wallets =', wallets);
  console.log('Debug: Wallet Store Account =', account);
  console.log('Debug: Wagmi Chain ID =', wagmiChainId);

  // Find the active wallet that matches the address stored in useWalletStore
  const activeWallet = wallets.find(
    (wallet) => wallet.address.toLowerCase() === account?.address?.toLowerCase()
  );
  const activeAddress = activeWallet?.address;
  useTransactionHistory(activeAddress);

  console.log('Debug: Final activeAddress for useBalance =', activeAddress);

  // Determine the activeChainId: prioritize wagmiChainId, then activeWallet.chainId, then default
  const activeChainId = wagmiChainId || (activeWallet?.chainId ? parseInt(activeWallet.chainId.split(':')[1], 10) : 84532);
  
  console.log('Debug: activeAddress =', activeAddress, 'activeChainId =', activeChainId);

  useEffect(() => {
    if (activeChainId) {
      setActiveChain(activeChainId.toString());
    }
  }, [activeChainId, setActiveChain]);

  const { data: nativeBalanceData, isLoading: nativeLoading, error: nativeError, refetch: refetchNative } = useBalance({
    address: activeAddress as `0x${string}`,
    chainId: activeChainId,
    query: {
      enabled: !!activeAddress,
      refetchInterval: 10000,
      staleTime: 5000,
    },
  });

  // Fetch balances for all tokens
  useEffect(() => {
    if (activeAddress && activeChainId) {
      const oracle = new RealTimePriceOracle();
      const chainTokens = oracle.getSupportedTokens(activeChainId.toString());
      
      const fetchBalances = async () => {
        setBalancesLoading(true);
        const newBalances: Record<string, string> = {};

        // Fetch native balance
        if (nativeBalanceData) {
          newBalances['ETH'] = nativeBalanceData.formatted;
        }

        // Fetch ERC20 balances
        if (chainTokens) {
          for (const token of chainTokens) {
            try {
              const tokenAddress = oracle.getTokenAddress(activeChainId.toString(), token) as `0x${string}`;
              if (tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000') {
                const tokenBalanceData = await getBalance(wagmiConfig, {
                  address: activeAddress as `0x${string}`,
                  token: tokenAddress,
                  chainId: activeChainId as AllowedChainId,
                });
                if (tokenBalanceData) {
                  newBalances[token] = tokenBalanceData.formatted;
                }
              }
            } catch (e) {
              console.error(`Error fetching balance for ${token}:`, e);
            }
          }
        }
        
        console.log('Debug: All balances fetched =', newBalances);
        setBalances(activeChainId.toString(), newBalances);
        setBalancesLoading(false);
        if (isLoading) setIsLoading(false);
      };

      fetchBalances();
    }
  }, [activeAddress, activeChainId, nativeBalanceData, setBalances, setBalancesLoading, isLoading]);


  // Debug logs to help troubleshoot
  useEffect(() => {
    console.log('🔍 Balance Debug Info:', {
      activeAddress,
      activeChainId,
      balanceData: nativeBalanceData?.formatted,
      isLoading: nativeLoading,
      error: nativeError?.message,
    });
    if (nativeError) {
      console.error('🚨 Balance Fetch Error:', nativeError);
    }
  }, [activeAddress, activeChainId, nativeBalanceData, nativeLoading, nativeError]);

  useEffect(() => {
    if (nativeBalanceData) {
      console.log('✅ ETH Balance loaded:', nativeBalanceData.formatted);
      // The main useEffect now handles setting balances
    }
  }, [nativeBalanceData]);

  // Refetch balance when chain changes
  useEffect(() => {
    if (activeAddress && activeChainId) {
      refetchNative();
    }
  }, [activeChainId, activeAddress, refetchNative]);

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = async () => {
    await logout();
    setAccount(null);
    setAuthenticated(false);
    router.push("/");
    setShowLogoutConfirm(false);
  };

  const handleCancelLogout = () => setShowLogoutConfirm(false);

  // Show loading or error states
  const ethBalance = nativeLoading 
    ? "..." 
    : nativeError 
    ? "0" 
    : nativeBalanceData?.formatted || "0";
  
  console.log('Debug: ethBalance passed to WalletCard =', ethBalance);
    
  const chainName =
    wagmiConfig.chains.find((c) => c.id === activeChainId)?.name || "Base Sepolia";

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-foreground">Loading...</p>
      </div>
    );
  }

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
              onClick={handleLogout}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <LogOut size={20} />
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

          {/* Arbitrage Scanner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <ArbitrageScanner />
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
      <EnhancedAIAssistant />
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