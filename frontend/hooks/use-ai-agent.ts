"use client"

import { useWalletStore } from "@/store/wallet-store"
import { useWallet } from "./user-privy-auth"
import { ArbitrageAgent } from "@/lib/AI"
import { AcrossBridgeService } from "@/lib/acrossBridge"
import { useEffect, useMemo, useState } from "react"

export interface AgentSuggestion {
  id: string
  title: string
  description: string
  confidence: number
  type: "OPTIMIZE_SWAP" | "SECURITY_ALERT" | "COST_SAVING" | "ARBITRAGE"
  recommendedAction?: {
    type: string
    params: Record<string, unknown>
  }
  estimatedSavings?: string
  riskLevel?: "low" | "medium" | "high"
  opportunity?: any
}

export function useAIAgent() {
  const { smartAccount } = useWallet()
  const [suggestions, setSuggestions] = useState<AgentSuggestion[]>([])

  const bridgeService = useMemo(() => new AcrossBridgeService(), [])
  const agent = useMemo(() => {
    if (smartAccount) {
      // IMPORTANT: Replace with your actual Alchemy API key
      const alchemyApiKey = "YOUR_ALCHEMY_API_KEY"
      return new ArbitrageAgent(bridgeService, smartAccount, alchemyApiKey)
    }
    return null
  }, [smartAccount, bridgeService])

  useEffect(() => {
    if (agent) {
      const fetchOpportunities = async () => {
        const opportunities = await agent.scanOpportunities()
        const arbitrageSuggestions = opportunities.map((opp, index) => ({
          id: `arb-${index}`,
          title: `Arbitrage ${opp.token}`,
          description: `From chain ${opp.fromChain} to ${opp.toChain} for ${opp.profitPercent.toFixed(2)}% profit.`,
          confidence: 0.95,
          type: "ARBITRAGE",
          riskLevel: "medium",
          estimatedSavings: `$${opp.estimatedProfit.toFixed(2)}`,
          opportunity: opp,
        }))
        setSuggestions(arbitrageSuggestions)
      }

      fetchOpportunities()
      const interval = setInterval(fetchOpportunities, agent.config.scanInterval)
      return () => clearInterval(interval)
    }
  }, [agent])

  const executeAction = async (suggestion: AgentSuggestion) => {
    if (suggestion.type === "ARBITRAGE" && agent && suggestion.opportunity) {
      return await agent.executeArbitrage(suggestion.opportunity)
    }
    // TODO: Execute other types of actions
    return {
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      status: "pending",
      estimatedTime: "2-5 seconds",
    }
  }

  return {
    suggestions,
    executeAction,
  }
}
