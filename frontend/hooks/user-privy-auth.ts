"use client"

import { useWalletStore } from "@/store/wallet-store"
import type { Chain, Transaction } from "@/store/wallet-store"

// Mock chain list
const MOCK_CHAINS: Chain[] = [
  {
    id: "base",
    name: "Base",
    icon: "⬤",
    nativeToken: "ETH",
    blockExplorer: "https://basescan.org",
  },
  {
    id: "optimism",
    name: "Optimism",
    icon: "◆",
    nativeToken: "ETH",
    blockExplorer: "https://optimistic.etherscan.io",
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    icon: "▲",
    nativeToken: "ETH",
    blockExplorer: "https://arbiscan.io",
  },
  {
    id: "polygon",
    name: "Polygon",
    icon: "●",
    nativeToken: "MATIC",
    blockExplorer: "https://polygonscan.com",
  },
]

// Mock balances per chain
const MOCK_BALANCES: Record<string, Record<string, string>> = {
  base: {
    ETH: "2.5483",
    USDC: "1250.50",
    DAI: "500.00",
  },
  optimism: {
    ETH: "1.2301",
    USDC: "2500.75",
    OP: "100.50",
  },
  arbitrum: {
    ETH: "0.8765",
    USDC: "1500.25",
    ARB: "250.00",
  },
  polygon: {
    MATIC: "5000.00",
    USDC: "3000.00",
    AAVE: "5.50",
  },
}

export function useWallet() {
  const { activeChain, setActiveChain, balances, setBalances, addTransaction, updateTransaction } = useWalletStore()

  const switchChain = (chainId: string) => {
    setActiveChain(chainId)
    // TODO: Call relayer API to switch chain on-chain
    // For now, just update mock balances
    const chainBalances = MOCK_BALANCES[chainId] || {}
    setBalances(chainId, chainBalances)
  }

  const getAvailableChains = () => MOCK_CHAINS

  const getCurrentChain = () => MOCK_CHAINS.find((c) => c.id === activeChain)

  const getChainBalances = (chainId: string = activeChain) => {
    return balances[chainId] || MOCK_BALANCES[chainId] || {}
  }

  const sendTransaction = async (to: string, amount: string, token: string) => {
    // TODO: Wire to real AA relayer (pimlico/stackup)
    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      hash: `0x${Math.random().toString(16).slice(2, 66)}`,
      from: "YOUR_ADDRESS", // Will be set from account
      to,
      amount,
      token,
      type: "send",
      status: "pending",
      timestamp: Date.now(),
      gasSponsored: true,
      chainId: activeChain,
    }
    addTransaction(tx)

    // Simulate confirmation after 2 seconds
    setTimeout(() => {
      updateTransaction(tx.id, { status: "success" })
    }, 2000)

    return tx
  }

  const swapTokens = async (fromToken: string, toToken: string, amount: string) => {
    // TODO: Wire to real DEX aggregator (1inch, 0x, etc)
    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      hash: `0x${Math.random().toString(16).slice(2, 66)}`,
      from: "YOUR_ADDRESS",
      amount,
      token: `${fromToken}→${toToken}`,
      type: "swap",
      status: "pending",
      timestamp: Date.now(),
      gasSponsored: true,
      chainId: activeChain,
    }
    addTransaction(tx)

    setTimeout(() => {
      updateTransaction(tx.id, { status: "success" })
    }, 2000)

    return tx
  }

  return {
    activeChain,
    switchChain,
    getAvailableChains,
    getCurrentChain,
    getChainBalances,
    sendTransaction,
    swapTokens,
  }
}
