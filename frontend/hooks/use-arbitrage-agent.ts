"use client";

import { useState, useEffect, useCallback } from "react";
import { RealTimePriceOracle } from "@/lib/priceOracle";
import { RealAcrossQuote } from "@/lib/acrossQuote";
import { ethers } from "ethers";

// Define the structure of an arbitrage opportunity
export interface AgentSuggestion {
  id: string;
  title: string;
  description: string;
  fromChainId: number;
  toChainId: number;
  fromChainName: string;
  toChainName: string;
  token: string;
  amount: string;
  profitPercent: number;
  estimatedProfit: string;
  fromPrice: number;
  toPrice: number;
  bridgeFee: string;
  gasEstimate: string; // This will be a mock value
  netProfit: string;
  riskLevel: "low" | "medium" | "high";
  priceImpact: number; // This will be a mock value
  liquidityDepth: string; // This will be a mock value
  timestamp: number;
}

// Define the structure for scan progress updates
export interface ScanProgress {
  currentChain: string;
  currentToken: string;
  totalScans: number;
  completedScans: number;
  routesAnalyzed: number;
  opportunitiesFound: number;
}

// Define the structure for activity logs
export interface ActivityLog {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: number;
}

// Supported chains and tokens from priceOracle
const CHAINS = {
  '8453': "Base",
  '42161': "Arbitrum",
};
const CHAIN_IDS = Object.keys(CHAINS);
const TOKENS = ["USDC", "WETH", "DAI"];

const priceOracle = new RealTimePriceOracle();
const acrossQuote = new RealAcrossQuote();

export function useArbitrageAgent() {
  const [suggestions, setSuggestions] = useState<AgentSuggestion[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [executingId, setExecutingId] = useState<string | null>(null);

  const addLog = useCallback((message: string, type: ActivityLog["type"]) => {
    const log: ActivityLog = {
      id: `log_${Date.now()}_${Math.random()}`,
      message,
      type,
      timestamp: Date.now(),
    };
    setActivityLogs((prev) => [log, ...prev].slice(0, 100));
  }, []);

  const scanForOpportunities = useCallback(async () => {
    addLog("Scanning for new arbitrage opportunities...", "info");

    const prices = await priceOracle.getBatchPrices(TOKENS, CHAIN_IDS);
    let completedScans = 0;
    const totalScans = TOKENS.length * CHAIN_IDS.length * (CHAIN_IDS.length - 1);

    for (const token of TOKENS) {
      for (const fromChainIdStr of CHAIN_IDS) {
        for (const toChainIdStr of CHAIN_IDS) {
          if (fromChainIdStr === toChainIdStr) continue;

          const fromChainId = parseInt(fromChainIdStr, 10);
          const toChainId = parseInt(toChainIdStr, 10);

          completedScans++;
          const fromChainName = CHAINS[fromChainIdStr as keyof typeof CHAINS];
          const toChainName = CHAINS[toChainIdStr as keyof typeof CHAINS];
          
          setScanProgress({
            currentChain: `${fromChainName} → ${toChainName}`,
            currentToken: token,
            totalScans,
            completedScans,
            routesAnalyzed: completedScans,
            opportunitiesFound: suggestions.length,
          });

          const fromPrice = prices.get(fromChainIdStr)?.get(token);
          const toPrice = prices.get(toChainIdStr)?.get(token);

          if (!fromPrice || !toPrice) continue;

          const profitPercent = ((toPrice - fromPrice) / fromPrice) * 100;

          if (profitPercent > 0.1) { // Minimum profit threshold
            const amount = "1000"; // Simulated trade amount
            
            const quote = await acrossQuote.getQuote({
                originChainId: fromChainId,
                destinationChainId: toChainId,
                token: token,
                amount: amount,
                recipient: ethers.ZeroAddress, // Dummy address
            });

            if (!quote || quote.isAmountTooLow) continue;

            const estimatedProfit = (parseFloat(amount) * (profitPercent / 100));
            const bridgeFee = parseFloat(quote.totalFee);
            const gasEstimate = 5; // Mock gas estimate
            const netProfit = estimatedProfit - bridgeFee - gasEstimate;

            if (netProfit > 0) {
              const newSuggestion: AgentSuggestion = {
                id: `opp_${Date.now()}_${token}_${fromChainId}_${toChainId}`,
                title: `${token} Arbitrage`,
                description: `Price difference detected for ${token} between ${fromChainName} and ${toChainName}.`,
                fromChainId,
                toChainId,
                fromChainName,
                toChainName,
                token,
                amount,
                profitPercent: parseFloat(profitPercent.toFixed(2)),
                estimatedProfit: estimatedProfit.toFixed(2),
                fromPrice,
                toPrice,
                bridgeFee: bridgeFee.toFixed(2),
                gasEstimate: gasEstimate.toFixed(2),
                netProfit: netProfit.toFixed(2),
                riskLevel: profitPercent > 2 ? "medium" : "low",
                priceImpact: Math.random() * 0.1, // Mock value
                liquidityDepth: "High", // Mock value
                timestamp: Date.now(),
              };
              setSuggestions((prev) => [newSuggestion, ...prev]);
              addLog(`💰 Found ${newSuggestion.profitPercent}% profit for ${token} (${fromChainName} → ${toChainName})`, "success");
            }
          }
        }
      }
    }
  }, [addLog, suggestions.length]);

  useEffect(() => {
    let scanInterval: NodeJS.Timeout;
    if (isScanning) {
      scanForOpportunities(); // Initial scan
      scanInterval = setInterval(scanForOpportunities, 30000); // Rescan every 30 seconds
    }
    return () => clearInterval(scanInterval);
  }, [isScanning, scanForOpportunities]);

  const startScanning = () => {
    setSuggestions([]);
    setActivityLogs([]);
    addLog("🤖 AI Agent activated. Starting scan...", "success");
    setIsScanning(true);
  };

  const stopScanning = () => {
    addLog("🛑 AI Agent stopped.", "info");
    setIsScanning(false);
    setScanProgress(null);
  };

  const executeSuggestion = async (suggestion: AgentSuggestion) => {
    setExecutingId(suggestion.id);
    addLog(`⚡ Executing: ${suggestion.token} ${suggestion.fromChainName} → ${suggestion.toChainName}`, "info");
    
    try {
      // Simulate a transaction execution
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // On success, remove the suggestion and log completion
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
      addLog(`✅ Success! Profit: $${suggestion.estimatedProfit}`, "success");
    } catch (error) {
      addLog(`❌ Execution failed: An unknown error occurred.`, "error");
    } finally {
      setExecutingId(null);
    }
  };

  return {
    suggestions,
    isScanning,
    scanProgress,
    activityLogs,
    executingId,
    startScanning,
    stopScanning,
    executeSuggestion,
  };
}