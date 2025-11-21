"use client";

import { useState, useEffect, useCallback } from "react";
import { RealTimePriceOracle } from "@/lib/priceOracle";
import { RealAcrossQuote } from "@/lib/acrossQuote";
import { ethers } from "ethers";
import { base, arbitrum, optimism, polygon, avalanche } from 'viem/chains'; // Import viem chain objects
import { Address } from 'viem'; 
import { useAcrossBridge } from "./useAcrossBridge"; // Import useAcrossBridge
import { useGeminiAI } from "./useGeminiAI"; 
import { useAccount } from 'wagmi'; // Import useAccount

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
  gasEstimate: string; 
  netProfit: string;
  riskLevel: "low" | "medium" | "high";
  priceImpact: number; 
  liquidityDepth: string; 
  timestamp: number;
  // Add decimals to suggestion for bridge execution
  tokenDecimals: number; 
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
const CHAINS = [
  { id: '8453', name: "Base", chain: base },
  { id: '42161', name: "Arbitrum", chain: arbitrum },
  { id: '10', name: "Optimism", chain: optimism },
  { id: '137', name: "Polygon", chain: polygon },
  { id: '43114', name: "Avalanche", chain: avalanche },
];
const CHAIN_IDS = CHAINS.map(c => c.id);
const TOKENS = [
  { symbol: "USDC", decimals: 6 },
  { symbol: "WETH", decimals: 18 },
  { symbol: "DAI", decimals: 18 },
  { symbol: "LINK", decimals: 18 },
  { symbol: "UNI", decimals: 18 },
  { symbol: "PEPE", decimals: 18 },
];

const priceOracle = new RealTimePriceOracle();
const acrossQuote = new RealAcrossQuote();

export function useArbitrageAgent() {
  const [suggestions, setSuggestions] = useState<AgentSuggestion[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [executingId, setExecutingId] = useState<string | null>(null);

  const { executeBridge } = useAcrossBridge(); // Instantiate useAcrossBridge
  const { generateContent, isLoading: isGeminiLoading, error: geminiError } = useGeminiAI(); // Instantiate useGeminiAI
  const { address } = useAccount(); // Destructure address from useAccount
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
    setSuggestions([]); // Clear suggestions at the start of each full scan

    const prices = await priceOracle.getBatchPrices(TOKENS.map(t => t.symbol), CHAIN_IDS);
    let completedScans = 0;
    const totalScans = TOKENS.length * CHAINS.length * (CHAINS.length - 1);
    const defaultTradeAmountUsd = 1000; // USD value
    const ethPrice = await priceOracle.getEthPrice();
    if (ethPrice === undefined) {
      addLog("Failed to fetch ETH price. Cannot proceed with arbitrage scan.", "error");
      setIsScanning(false);
      return;
    }
    const defaultTradeAmountEth = (defaultTradeAmountUsd / ethPrice).toFixed(6); // ETH equivalent

    const potentialOpportunities = [];

    for (const token of TOKENS) {
      for (const fromChainConfig of CHAINS) {
        for (const toChainConfig of CHAINS) {
          if (fromChainConfig.id === toChainConfig.id) continue;

          const fromChainId = parseInt(fromChainConfig.id, 10);
          const toChainId = parseInt(toChainConfig.id, 10);

          completedScans++;
          const fromChainName = fromChainConfig.name;
          const toChainName = toChainConfig.name;
          
          setScanProgress({
            currentChain: `${fromChainName} → ${toChainName}`,
            currentToken: token.symbol,
            totalScans,
            completedScans,
            routesAnalyzed: completedScans,
            opportunitiesFound: suggestions.length,
          });

          const fromPrice = prices.get(fromChainConfig.id)?.get(token.symbol);
          const toPrice = prices.get(toChainConfig.id)?.get(token.symbol);

          if (!fromPrice || !toPrice) continue;

          const profitPercent = ((toPrice - fromPrice) / fromPrice) * 100;

          if (profitPercent > 0.5) { // Increased minimum profit threshold for faster filtering
            potentialOpportunities.push({
              token,
              fromChainId,
              toChainId,
              fromChainName,
              toChainName,
              fromPrice,
              toPrice,
              profitPercent,
              amount: defaultTradeAmountUsd.toString(), // Use defaultTradeAmountUsd here
            });
          }
        }
      }
    }

    addLog(`Found ${potentialOpportunities.length} potential opportunities, now fetching quotes and consulting AI...`, "info");
    // Process opportunities in parallel
    const processedOpportunities = await Promise.allSettled(
      potentialOpportunities.map(async (opportunity) => {
                  const { token, fromChainId, toChainId, fromChainName, toChainName, fromPrice, toPrice, profitPercent } = opportunity;
        
                  // Calculate tradeAmount based on token type and USD value
                  let tradeAmount: string;
                  let tradeAmountUsd: number;
        
                  if (token.symbol === "WETH") {
                    tradeAmount = defaultTradeAmountEth;
                    tradeAmountUsd = defaultTradeAmountUsd; // USD value is already defaultTradeAmountUsd
                  } else if (token.symbol === "USDC" || token.symbol === "DAI") {
                    tradeAmount = defaultTradeAmountUsd.toString(); // Stablecoins, amount is USD value
                    tradeAmountUsd = defaultTradeAmountUsd;
                  } else {
                    // For other tokens, convert USD value to token amount based on price on the 'from' chain
                    const tokenPriceUsd = prices.get(fromChainId.toString())?.get(token.symbol);
                    if (!tokenPriceUsd || tokenPriceUsd === 0) {
                      addLog(`Could not get USD price for ${token.symbol} on ${fromChainName}. Skipping opportunity.`, "warning");
                      return null; // Cannot calculate token amount without price
                    }
                    tradeAmount = (defaultTradeAmountUsd / tokenPriceUsd).toFixed(token.decimals);
                    tradeAmountUsd = defaultTradeAmountUsd;
                  }
        
                try {
                  const quote = await acrossQuote.getQuote({
                      originChainId: fromChainId,
                      destinationChainId: toChainId,
                      token: token.symbol,
                      amount: tradeAmount, // Use the calculated tradeAmount
                      decimals: token.decimals,
                      recipient: ethers.ZeroAddress, // Dummy address for quoting
                  });
        
                  if (!quote || quote.isAmountTooLow) {
                    // addLog(`Quote not found or amount too low for ${token.symbol} (${fromChainName} → ${toChainName})`, "info");
                    return null; // Skip if no valid quote
                  }
        
                  const estimatedProfit = (tradeAmountUsd * (profitPercent / 100)); // Calculate profit based on USD value
                  const bridgeFee = parseFloat(quote.totalFee);
                  const gasEstimate = 5; // Mock gas estimate (e.g., in USD)
                  const netProfit = estimatedProfit - bridgeFee - gasEstimate;

                  if (netProfit > 0) {
            const geminiPrompt = `Analyze this potential arbitrage opportunity:
            Token: ${token.symbol}
            From Chain: ${fromChainName} (ID: ${fromChainId})
            To Chain: ${toChainName} (ID: ${toChainId})
            Trade Amount (${token.symbol}): ${tradeAmount}
            Equivalent USD Value: ${tradeAmountUsd.toFixed(2)}
            Price on From Chain: $${fromPrice.toFixed(4)}
            Price on To Chain: $${toPrice.toFixed(4)}
            Gross Profit Percentage: ${profitPercent.toFixed(2)}%
            Estimated Bridge Fee: $${bridgeFee.toFixed(4)}
            Estimated Gas Cost: $${gasEstimate.toFixed(4)}
            Net Profit (estimated): $${netProfit.toFixed(4)}

            Given these details, do you recommend executing this arbitrage? Respond with ONLY "EXECUTE" or "DO NOT EXECUTE". Do not include any other text.`;

            const aiDecision = await generateContent(geminiPrompt);

            if (aiDecision && aiDecision.trim().toUpperCase() === "EXECUTE") {
              const newSuggestion: AgentSuggestion = {
                id: `opp_${Date.now()}_${token.symbol}_${fromChainId}_${toChainId}`,
                title: `${token.symbol} Arbitrage`,
                description: `Price difference detected for ${token.symbol} between ${fromChainName} and ${toChainName}. AI recommends execution.`,
                fromChainId,
                toChainId,
                fromChainName,
                toChainName,
                token: token.symbol,
                amount: tradeAmount, // Use the calculated tradeAmount
                profitPercent: parseFloat(profitPercent.toFixed(2)),
                estimatedProfit: estimatedProfit.toFixed(2),
                fromPrice,
                toPrice,
                bridgeFee: bridgeFee.toFixed(2),
                gasEstimate: gasEstimate.toFixed(2),
                netProfit: netProfit.toFixed(2),
                riskLevel: profitPercent > 2 ? "medium" : "low",
                priceImpact: 0,
                liquidityDepth: "N/A",
                timestamp: Date.now(),
                tokenDecimals: token.decimals,
              };
              addLog(`💰 Found ${newSuggestion.profitPercent}% profit for ${token.symbol} (${fromChainName} → ${toChainName}) - AI Recommends EXECUTE`, "success");
              return newSuggestion;
            } else {
              addLog(`❌ Gemini AI did not recommend executing ${token.symbol} (${fromChainName} → ${toChainName}) - Decision: ${aiDecision}`, "warning");
              return null;
            }
          }
        } catch (err: any) {
          console.error(`Error processing opportunity for ${token.symbol} (${fromChainName} → ${toChainName}):`, err);
          addLog(`Error processing ${token.symbol} (${fromChainName} → ${toChainName}): ${err.message}`, "error");
          return null;
        }
        return null; // Should not reach here if netProfit <= 0 or other conditions
      })
    );
    
    // Filter out null results and add valid suggestions
    const validSuggestions = processedOpportunities
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => (result as PromiseFulfilledResult<AgentSuggestion>).value);
    
    setSuggestions(prev => [...prev, ...validSuggestions]);
    addLog(`Scan complete. Found ${validSuggestions.length} new opportunities.`, "info");
    
    if (geminiError) {
        addLog(`Error from Gemini AI: ${geminiError}`, "error");
    }
  }, [addLog, generateContent, geminiError]);

  useEffect(() => {
    let scanInterval: NodeJS.Timeout;
    if (isScanning && !isGeminiLoading) { // Only scan if Gemini isn't busy
      scanForOpportunities(); // Initial scan
      scanInterval = setInterval(scanForOpportunities, 30000); // Rescan every 30 seconds
    }
    return () => clearInterval(scanInterval);
  }, [isScanning, scanForOpportunities, isGeminiLoading]);

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
    addLog(`⚡ Executing: ${suggestion.token} ${suggestion.fromChainName} → ${suggestion.toChainName} for amount ${suggestion.amount}`, "info");
    
    try {
      // Use useAcrossBridge to execute the real bridge
      await executeBridge({
        fromChainId: suggestion.fromChainId,
        toChainId: suggestion.toChainId,
        inputTokenAddress: priceOracle.getTokenAddress(suggestion.fromChainId.toString(), suggestion.token) as Address,
        outputTokenAddress: priceOracle.getTokenAddress(suggestion.toChainId.toString(), suggestion.token) as Address, // Assuming same token symbol on both sides
        amount: suggestion.amount,
        decimals: suggestion.tokenDecimals,
        recipient: (address as Address) || (ethers.ZeroAddress as Address), // Use connected address, fallback to ZeroAddress
      }, (progress) => {
        console.log("Arbitrage Bridge Progress:", progress);
        // You can update activity logs based on progress here
        if (progress.step === 'fill' && progress.status === 'txSuccess' && progress.txReceipt) {
            addLog(`✅ Bridge successful for ${suggestion.token}! Tx: ${progress.txReceipt.transactionHash}`, "success");
        }
      });
      
      // On success, remove the suggestion
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
      addLog(`✅ Arbitrage executed for ${suggestion.token} with estimated profit: $${suggestion.estimatedProfit}`, "success");
    } catch (error: any) {
      addLog(`❌ Execution failed for ${suggestion.token}: ${error.message || error.toString()}`, "error");
      console.error('Arbitrage execution error:', error);
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