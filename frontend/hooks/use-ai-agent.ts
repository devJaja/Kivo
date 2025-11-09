"use client"

import { useWalletStore } from "@/store/wallet-store"
import { useWallet } from "./user-privy-auth"

export interface AgentSuggestion {
  id: string
  title: string
  description: string
  confidence: number
  type: "OPTIMIZE_SWAP" | "SECURITY_ALERT" | "COST_SAVING"
  recommendedAction?: {
    type: string
    params: Record<string, unknown>
  }
  estimatedSavings?: string
  riskLevel?: "low" | "medium" | "high"
}

export function useAIAgent() {
  const { account } = useWalletStore()
  const { getChainBalances, activeChain } = useWallet()

  const generateSuggestions = (): AgentSuggestion[] => {
    // TODO: Replace with real AI endpoint call
    // For now, generate deterministic mock suggestions based on balances

    const balances = getChainBalances()
    const suggestions: AgentSuggestion[] = []

    // Suggestion 1: Optimize swap
    if (balances.USDC && Number.parseFloat(balances.USDC) > 100) {
      suggestions.push({
        id: "sug-1",
        title: "Optimize USDC→ETH Swap",
        description: `Swap ${balances.USDC} USDC to ETH on Base. Estimated 0.3% fee savings vs DEX average.`,
        confidence: 0.92,
        type: "OPTIMIZE_SWAP",
        recommendedAction: {
          type: "swap",
          params: { fromToken: "USDC", toToken: "ETH", chainId: activeChain },
        },
        estimatedSavings: "$3.75",
      })
    }

    // Suggestion 2: Cost saving via chain switch
    if (activeChain === "polygon") {
      suggestions.push({
        id: "sug-2",
        title: "Move Assets to Base for Lower Fees",
        description: "Base network has 90% lower transaction costs. Consider moving liquidity there.",
        confidence: 0.85,
        type: "COST_SAVING",
        riskLevel: "low",
        estimatedSavings: "$15-25/month",
      })
    }

    // Suggestion 3: Security alert (mock)
    suggestions.push({
      id: "sug-3",
      title: "Account Security Checkup",
      description: "Your wallet is secure. No unusual activity detected. Keep using trusted apps.",
      confidence: 0.95,
      type: "SECURITY_ALERT",
      riskLevel: "low",
    })

    return suggestions
  }

  const askAgent = (question: string): AgentSuggestion | null => {
    // TODO: Send question to real AI endpoint
    // For now, deterministic parsing of common patterns

    const lower = question.toLowerCase()

    if (lower.includes("optimize") || lower.includes("swap")) {
      return {
        id: "chat-opt",
        title: "Swap Optimization",
        description: "I found a better swap route on Base with 0.25% slippage.",
        confidence: 0.88,
        type: "OPTIMIZE_SWAP",
        estimatedSavings: "$2.50",
      }
    }

    if (lower.includes("fee") || lower.includes("cost")) {
      return {
        id: "chat-cost",
        title: "Cost Reduction Strategy",
        description: "Switch to Optimism for 70% lower fees on your next transaction.",
        confidence: 0.82,
        type: "COST_SAVING",
        estimatedSavings: "$5.00",
      }
    }

    if (lower.includes("secure") || lower.includes("safety")) {
      return {
        id: "chat-sec",
        title: "Security Status",
        description: "Your account is secure. No risks detected. All connections are verified.",
        confidence: 0.99,
        type: "SECURITY_ALERT",
        riskLevel: "low",
      }
    }

    return null
  }

  const executeAction = async (suggestion: AgentSuggestion) => {
    // TODO: Execute real on-chain action via relayer
    // Return simulated transaction
    return {
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      status: "pending",
      estimatedTime: "2-5 seconds",
    }
  }

  return {
    generateSuggestions,
    askAgent,
    executeAction,
  }
}
