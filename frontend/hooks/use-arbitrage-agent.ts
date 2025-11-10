
"use client";

import { useState, useEffect, useCallback } from "react";

// Define the structure of an arbitrage opportunity
export interface AgentSuggestion {
  id: string;
  title: string;
  description: string;
  fromChainName: string;
  toChainName: string;
  token: string;
  amount: string;
  profitPercent: number;
  estimatedProfit: string;
  fromPrice: number;
  toPrice: number;
  bridgeFee: string;
  gasEstimate: string;
  netProfit: string;
  riskLevel: "low" | "medium" | "high";
  priceImpact: number;
  liquidityDepth: string;
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

// Chains and tokens to be scanned
const CHAINS = {
  "base": "Base",
  "base-sepolia": "Base Sepolia",
};

const TOKENS = ["ETH", "USDC", "DAI", "WETH"];

// Simulate price feeds with slight variations
const getSimulatedPrice = (token: string, chain: keyof typeof CHAINS) => {
  const basePrices: { [key: string]: number } = {
    ETH: 3500,
    USDC: 1.0,
    DAI: 0.99,
    WETH: 3500,
  };
  const price = basePrices[token] || 1;
  const volatility = 0.005; // 0.5%
  
  // Introduce a slight, deterministic price difference between chains
  const chainMultiplier = chain === "base" ? 1.001 : 0.999;
  
  // Add random fluctuation
  const randomFactor = 1 + (Math.random() - 0.5) * volatility;
  
  return price * chainMultiplier * randomFactor;
};

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

  const scanForOpportunities = useCallback(() => {
    addLog("Scanning for new arbitrage opportunities...", "info");

    let completedScans = 0;
    const totalScans = TOKENS.length * 2; // Each token checked in both directions

    TOKENS.forEach((token) => {
      const priceBase = getSimulatedPrice(token, "base");
      const priceBaseSepolia = getSimulatedPrice(token, "base-sepolia");

      const checkArbitrage = (fromChain: keyof typeof CHAINS, toChain: keyof typeof CHAINS, fromPrice: number, toPrice: number) => {
        completedScans++;
        const profitPercent = ((toPrice - fromPrice) / fromPrice) * 100;

        if (profitPercent > 0.1) { // Minimum profit threshold
          const amount = "1000"; // Simulated trade amount
          const estimatedProfit = (parseFloat(amount) * (profitPercent / 100)).toFixed(2);
          const bridgeFee = (Math.random() * 2 + 1).toFixed(2); // $1-$3
          const gasEstimate = (Math.random() * 5 + 2).toFixed(2); // $2-$7
          const netProfit = (parseFloat(estimatedProfit) - parseFloat(bridgeFee) - parseFloat(gasEstimate)).toFixed(2);

          if (parseFloat(netProfit) > 0) {
            const newSuggestion: AgentSuggestion = {
              id: `opp_${Date.now()}_${token}_${fromChain}`,
              title: `${token} Arbitrage`,
              description: `Price difference detected for ${token} between ${CHAINS[fromChain]} and ${CHAINS[toChain]}.`,
              fromChainName: CHAINS[fromChain],
              toChainName: CHAINS[toChain],
              token,
              amount,
              profitPercent: parseFloat(profitPercent.toFixed(2)),
              estimatedProfit,
              fromPrice,
              toPrice,
              bridgeFee,
              gasEstimate,
              netProfit,
              riskLevel: profitPercent > 2 ? "medium" : "low",
              priceImpact: Math.random() * 0.1,
              liquidityDepth: "High",
              timestamp: Date.now(),
            };
            setSuggestions((prev) => [newSuggestion, ...prev]);
            addLog(`💰 Found ${newSuggestion.profitPercent}% profit for ${token} (${CHAINS[fromChain]} → ${CHAINS[toChain]})`, "success");
          }
        }
        
        setScanProgress({
          currentChain: `${CHAINS[fromChain]} → ${CHAINS[toChain]}`,
          currentToken: token,
          totalScans,
          completedScans,
          routesAnalyzed: completedScans,
          opportunitiesFound: suggestions.length,
        });
      };

      // Check Base -> Base Sepolia
      checkArbitrage("base", "base-sepolia", priceBase, priceBaseSepolia);
      // Check Base Sepolia -> Base
      checkArbitrage("base-sepolia", "base", priceBaseSepolia, priceBase);
    });
  }, [addLog, suggestions.length]);

  useEffect(() => {
    let scanInterval: NodeJS.Timeout;
    if (isScanning) {
      scanForOpportunities(); // Initial scan
      scanInterval = setInterval(scanForOpportunities, 8000); // Rescan every 8 seconds
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
