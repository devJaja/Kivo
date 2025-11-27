import { useState, useEffect, useCallback } from "react";
import { RealAcrossQuote } from "@/lib/acrossQuote";
import { ethers, JsonRpcProvider } from "ethers";
import { base, arbitrum, optimism, polygon, avalanche } from 'viem/chains'; // Import viem chain objects
import { Address } from 'viem'; 
import { useAcrossBridge } from "./useAcrossBridge"; // Import useAcrossBridge
import { useGeminiAI } from "./useGeminiAI"; 
import { useAccount } from 'wagmi'; // Import useAccount
import { dexReader } from '@/lib/dexReader'; // Import the new dexReader
import { CHAINS as AppChains, TOKENS as AppTokens } from '@/config'; // Import CHAINS and TOKENS from config

const THRESHOLDS = {
  ORACLE_ARB: {
    MIN_PROFIT_PERCENT: 0.1,    // 0.1% minimum
    MIN_NET_PROFIT_USD: 1,       // $1 minimum after all costs
    GAS_MULTIPLIER: 5            // 5x buffer for gas spikes
  },
  DEX_ARB: {
    MIN_PROFIT_PERCENT: 1.0,     // 1% minimum
    MIN_NET_PROFIT_USD: 10,      // 0 minimum after all costs
    SLIPPAGE_BUFFER: 0.02,       // 2% slippage expectation
    GAS_MULTIPLIER: 5            // 5x buffer for gas spikes
  },
  BASE_GAS_ESTIMATES: {
    SINGLE_SWAP: 0.001,          // Base estimate for one swap
    MULTI_SWAP: 0.002,           // Base estimate for arbitrage route
  }
};

const CHAINS_RPC = {
  '8453': 'https://mainnet.base.org',
  '42161': 'https://arb1.arbitrum.io/rpc',
  '10': 'https://mainnet.optimism.io',
  '137': 'https://polygon-rpc.com',
  '43114': 'https://api.avax.network/ext/bc/C/rpc',
};

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
  { symbol: "AERO", decimals: 18 },
  { symbol: "WBTC", decimals: 8 },
  { symbol: "BRETT", decimals: 18 },
];

function getTokenAddressFromConfig(chainName: string, tokenSymbol: string): Address | undefined {
    const chainKey = chainName.toLowerCase() as keyof typeof AppTokens;
    const chainTokens = AppTokens[chainKey];
    if (chainTokens && chainTokens[tokenSymbol as keyof typeof chainTokens]) {
        return chainTokens[tokenSymbol as keyof typeof chainTokens] as Address;
    }
    return undefined;
}

const acrossQuote = new RealAcrossQuote();

export function useArbitrageAgent() {
  const [suggestions, setSuggestions] = useState<AgentSuggestion[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [useDummyData, setUseDummyData] = useState(true); // Default to true for now

  const toggleDummyData = () => setUseDummyData(!useDummyData);

  const { executeBridge } = useAcrossBridge(); // Instantiate useAcrossBridge
  const { generateContent, isLoading: isGeminiLoading, error: geminiError } = useGeminiAI(); // Instantiate useGeminiAI
  const { address } = useAccount(); // Destructure address from useAccount
  const addLog = (message: string, type: ActivityLog["type"]) => {
    const log: ActivityLog = {
      id: `log_${Date.now()}_${Math.random()}`,
      message,
      type,
      timestamp: Date.now(),
    };
    setActivityLogs((prev) => [log, ...prev].slice(0, 100));
  };

  const getRealisticGasEstimate = async (
    provider: JsonRpcProvider,
    isMultiSwap: boolean = false
  ): Promise<number> => {
    try {
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei");
      
      // Estimate gas units based on operation type
      const estimatedGasUnits = isMultiSwap ? 350000n : 180000n;
      
      const gasCostWei = gasPrice * estimatedGasUnits;
      const gasCostNative = Number(ethers.formatEther(gasCostWei));
      
      // Apply multiplier for safety buffer
      const multiplier = isMultiSwap 
        ? THRESHOLDS.DEX_ARB.GAS_MULTIPLIER 
        : THRESHOLDS.ORACLE_ARB.GAS_MULTIPLIER;
      
      return gasCostNative * multiplier;
    } catch {
      // Fallback to conservative estimates
      const baseGas = isMultiSwap 
        ? THRESHOLDS.BASE_GAS_ESTIMATES.MULTI_SWAP 
        : THRESHOLDS.BASE_GAS_ESTIMATES.SINGLE_SWAP;
      
      const multiplier = isMultiSwap 
        ? THRESHOLDS.DEX_ARB.GAS_MULTIPLIER 
        : THRESHOLDS.ORACLE_ARB.GAS_MULTIPLIER;
      
      return baseGas * multiplier;
    }
  };

  const scanForOpportunities = useCallback(async () => {
    addLog("Scanning for new arbitrage opportunities using on-chain DEX prices...", "info");
    // setSuggestions([]); // No longer clear suggestions at the start of each full scan
  
    // Fetch all prices in parallel
    const pricePromises = [];
    for (const chain of CHAINS) {
      for (const token of TOKENS) {
        if (token.symbol === 'USDC') continue; // Skip USDC as it's our quote currency
        pricePromises.push(
          dexReader.getPrice(chain.name as keyof typeof AppChains, 'USDC', token.symbol)
            .then(price => ({ chain: chain.id, token: token.symbol, price }))
        );
      }
    }
  
    const results = await Promise.allSettled(pricePromises);
  
    // Process results into a structured map
    const prices = new Map<string, Map<string, number>>();
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value.price !== null) {
        const { chain, token, price } = result.value;
        if (!prices.has(chain)) {
          prices.set(chain, new Map());
        }
        prices.get(chain)!.set(token, price as number);
      }
    });
  
    let completedScans = 0;
    const totalScans = TOKENS.length * CHAINS.length * (CHAINS.length - 1);
    const defaultTradeAmountUsd = 1000; // USD value
    
    // Using a fixed ETH price for now for gas estimation, can be improved
    const ethPrice = await dexReader.getPrice('base', 'WETH', 'USDC') || 3000;

    const potentialOpportunities = [];
  
    for (const token of TOKENS) {
      if (token.symbol === 'USDC') continue;
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
  
          if (profitPercent > 0.1) { // Lowered minimum profit threshold
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
      
        let tradeAmount: string;
        const tradeAmountUsd = 1000; // Fixed trade amount for now
        
        if (fromPrice > 0) {
            tradeAmount = (tradeAmountUsd / fromPrice).toFixed(token.decimals);
        } else {
            return null; // Can't calculate trade amount if price is 0
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
            return null; // Skip if no valid quote
          }
      
          const estimatedProfit = (tradeAmountUsd * (profitPercent / 100)); // Calculate profit based on USD value
          const bridgeFee = parseFloat(quote.totalFee);
      
          const rpcUrl = CHAINS_RPC[fromChainId.toString() as keyof typeof CHAINS_RPC];
          if (!rpcUrl) {
            addLog(`RPC URL not found for chain ID ${fromChainId}. Skipping gas estimation.`, "warning");
            return null;
          }
          const provider = new JsonRpcProvider(rpcUrl);
          const gasNative = await getRealisticGasEstimate(provider, false);
          
          const nativeTokenPrice = await dexReader.getPrice(fromChainName as keyof typeof AppChains, 'WETH', 'USDC') || ethPrice;
          
          const gasEstimate = gasNative * nativeTokenPrice;
      
          const netProfit = estimatedProfit - bridgeFee - gasEstimate;

          if (netProfit > 0) {
            const geminiPrompt = `Analyze this potential arbitrage opportunity:
            Token: ${token.symbol}
            From Chain: ${fromChainName} (ID: ${fromChainId})
            To Chain: ${toChainName} (ID: ${toChainId})
            Trade Amount (${token.symbol}): ${tradeAmount}
            Equivalent USD Value: ${tradeAmountUsd.toFixed(2)}
            Price on From Chain: ${fromPrice.toFixed(4)}
            Price on To Chain: ${toPrice.toFixed(4)}
            Gross Profit Percentage: ${profitPercent.toFixed(2)}%
            Estimated Bridge Fee: ${bridgeFee.toFixed(4)}
            Estimated Gas Cost: ${gasEstimate.toFixed(4)}
            Net Profit (estimated): ${netProfit.toFixed(4)}

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
        } catch (err: unknown) {
          console.error(`Error processing opportunity for ${token.symbol} (${fromChainName} → ${toChainName}):`, err);
          addLog(`Error processing ${token.symbol} (${fromChainName} → ${toChainName}): ${(err as Error).message}`, "error");
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
  }, [addLog, generateContent, geminiError, suggestions.length]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const scheduleScan = async () => {
      if (isScanning && !isGeminiLoading && !useDummyData) {
        await scanForOpportunities();
        timeoutId = setTimeout(scheduleScan, 3000); // Schedule next scan after 3 seconds
      } else if (isScanning && useDummyData) {
        // Handle dummy data generation if needed, but the startScanning already does this
      }
    };

    if (isScanning && !useDummyData) {
      scheduleScan(); // Start the first scan
    } else if (isScanning && useDummyData) {
        // If in dummy data mode, the startScanning function already handles the initial dummy data generation
        // and doesn't need continuous rescheduling in this useEffect for real scans.
        // The dummy data timeout simulates the "first" scan.
    }


    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isScanning, scanForOpportunities, isGeminiLoading, useDummyData]);

  const startScanning = () => {
    setSuggestions([]);
    setActivityLogs([]);
    addLog("🤖 AI Agent activated. Starting scan...", "success");
    setIsScanning(true);

    if (useDummyData) {
        addLog("DEV MODE: Generating dummy data.", "warning");
        setTimeout(() => {
            const dummySuggestions: AgentSuggestion[] = [
                {
                    id: `dummy_${Date.now()}_1`,
                    title: `WETH Arbitrage`,
                    description: `Price difference detected for WETH between Base and Arbitrum.`,
                    fromChainId: 8453,
                    toChainId: 42161,
                    fromChainName: "Base",
                    toChainName: "Arbitrum",
                    token: "WETH",
                    amount: "0.5",
                    profitPercent: 1.25,
                    estimatedProfit: "45.00",
                    fromPrice: 3000,
                    toPrice: 3037.5,
                    bridgeFee: "5.00",
                    gasEstimate: "10.00",
                    netProfit: "30.00",
                    riskLevel: "low",
                    priceImpact: 0.01,
                    liquidityDepth: "High",
                    timestamp: Date.now(),
                    tokenDecimals: 18,
                },
                {
                    id: `dummy_${Date.now()}_2`,
                    title: `LINK Arbitrage`,
                    description: `Price difference detected for LINK between Polygon and Optimism.`,
                    fromChainId: 137,
                    toChainId: 10,
                    fromChainName: "Polygon",
                    toChainName: "Optimism",
                    token: "LINK",
                    amount: "100",
                    profitPercent: 2.5,
                    estimatedProfit: "35.00",
                    fromPrice: 14,
                    toPrice: 14.35,
                    bridgeFee: "2.00",
                    gasEstimate: "8.00",
                    netProfit: "25.00",
                    riskLevel: "medium",
                    priceImpact: 0.05,
                    liquidityDepth: "Medium",
                    timestamp: Date.now(),
                    tokenDecimals: 18,
                },
            ];
            setSuggestions(dummySuggestions);
            addLog(`✅ Found ${dummySuggestions.length} dummy opportunities.`, "success");
            setUseDummyData(false); // Switch to real scanning after displaying dummy data
        }, 12000); // 12 second delay to simulate scanning
    }
  };

  const stopScanning = () => {
    addLog("🛑 AI Agent stopped.", "info");
    setIsScanning(false);
    setScanProgress(null);
  };

  const executeSuggestion = async (suggestion: AgentSuggestion) => {
    setExecutingId(suggestion.id);
    addLog(`⚡ Executing: ${suggestion.token} ${suggestion.fromChainName} → ${suggestion.toChainName} for amount ${suggestion.amount}`, "info");
    
    const isNative = suggestion.token === 'WETH';

    try {
        const inputTokenAddress = getTokenAddressFromConfig(suggestion.fromChainName, suggestion.token);
        const outputTokenAddress = getTokenAddressFromConfig(suggestion.toChainName, suggestion.token);

        if (!inputTokenAddress || !outputTokenAddress) {
            throw new Error(`Token address not found for ${suggestion.token} on ${suggestion.fromChainName} or ${suggestion.toChainName}`);
        }

      await executeBridge({
        fromChainId: suggestion.fromChainId,
        toChainId: suggestion.toChainId,
        inputTokenAddress: inputTokenAddress,
        outputTokenAddress: outputTokenAddress,
        amount: suggestion.amount,
        decimals: suggestion.tokenDecimals,
        isNative,
        recipient: (address as Address) || (ethers.ZeroAddress as Address),
      }, (progress) => {
        console.log("Arbitrage Bridge Progress:", progress);
        if (progress.step === 'fill' && progress.status === 'txSuccess' && progress.txReceipt) {
            addLog(`✅ Bridge successful for ${suggestion.token}! Tx: ${progress.txReceipt.transactionHash}`, "success");
        }
      });
      
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
      addLog(`✅ Arbitrage executed for ${suggestion.token} with estimated profit: ${suggestion.estimatedProfit}`, "success");
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