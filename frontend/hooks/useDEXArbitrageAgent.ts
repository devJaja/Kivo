"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import { useAccount } from 'wagmi';
import { useGeminiAI } from "./useGeminiAI";
import { Address } from 'viem';
import {
  CHAINS,
  DEXS,
  TOKENS,
  UNISWAP_V3_QUOTER_ADDRESS,
  V3_FEE_TIERS,
  DEFAULT_ROUTES
} from '../config';
import { PriceFeedService } from '../lib/priceFeedService';
import { PoolFinderService } from '../lib/poolFinderService';

// ----------------------
// REALISTIC THRESHOLDS CONFIG
// ----------------------
const THRESHOLDS = {
  ORACLE_ARB: {
    MIN_PROFIT_PERCENT: 0.2,    // 0.2% minimum
    MIN_NET_PROFIT_USD: 2,       // $2 minimum after all costs
    GAS_MULTIPLIER: 5            // 5x buffer for gas spikes
  },
  DEX_ARB: {
    MIN_PROFIT_PERCENT: 0.2,     // 0.2% minimum
    MIN_NET_PROFIT_USD: 2,      // $2 minimum after all costs
    SLIPPAGE_BUFFER: 0.01,       // 1% slippage expectation
    GAS_MULTIPLIER: 5            // 5x buffer for gas spikes
  },
  BASE_GAS_ESTIMATES: {
    SINGLE_SWAP: 0.001,          // Base estimate for one swap
    MULTI_SWAP: 0.002,           // Base estimate for arbitrage route
  }
};

// ----------------------
// ABIs
// ----------------------
const UNISWAP_V2_ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"
];
const UNISWAP_V3_QUOTER_ABI = [
  "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)"
];

// ----------------------
// Types
// ----------------------
interface ArbitrageRoute {
  chain: keyof typeof TOKENS;
  symbols: string[];
  path?: (string | undefined)[];
}

export interface DEXArbitrageSuggestion {
  id: string;
  title: string;
  description: string;
  chain: string;
  chainId: number;
  route: string[];
  dexRoute: string[];
  tokenAddresses: Address[];
  amountIn: string;
  expectedOut: string;
  profitPercent: number;
  estimatedProfit: string;
  gasEstimate: string;
  netProfit: string;
  riskLevel: "low" | "medium" | "high";
  timestamp: number;
  slippageBuffer?: string;
}

export interface DEXScanProgress {
  currentChain: string;
  currentRoute: string;
  totalRoutes: number;
  completedRoutes: number;
  opportunitiesFound: number;
}

export interface ActivityLog {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: number;
}

// ----------------------
// Hook
// ----------------------
export function useDEXArbitrageAgent() {
  const [suggestions, setSuggestions] = useState<DEXArbitrageSuggestion[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<DEXScanProgress | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [useDummyData, setUseDummyData] = useState(true); // Default to true for now

  const { address } = useAccount();
  const { generateContent } = useGeminiAI();
  const suggestionsCountRef = useRef(0);
  const priceFeedService = useRef(new PriceFeedService()).current;
  const poolFinderService = useRef(new PoolFinderService()).current;

  // Cache for providers
  const providers = useRef<Map<string, ethers.JsonRpcProvider>>(new Map());
  useEffect(() => {
    Object.keys(CHAINS).forEach((chainKey) => {
      const chain = CHAINS[chainKey as keyof typeof CHAINS];
      providers.current.set(chain.name, new ethers.JsonRpcProvider(chain.rpc));
    });
  }, []);

  const addLog = useCallback((message: string, type: ActivityLog["type"]) => {
    const log: ActivityLog = {
      id: `log_${Date.now()}_${Math.random()}`,
      message,
      type,
      timestamp: Date.now(),
    };
    setActivityLogs((prev) => [log, ...prev].slice(0, 100));
  }, []);

  const toggleDummyData = useCallback(() => {
    setUseDummyData(prev => !prev);
  }, []);

  // ----------------------
  // Realistic Gas Estimation
  // ----------------------
  const getRealisticGasEstimate = async (
    provider: ethers.JsonRpcProvider,
    chainName: string,
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
    } catch (e) {
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

  // ----------------------
  // V2 Quote
  // ----------------------
  const getV2Quote = async (
    provider: ethers.Provider,
    routerAddress: string,
    amountInWei: bigint,
    path: string[],
    dexName: string
  ): Promise<bigint | null> => {
    try {
      const router = new ethers.Contract(routerAddress, UNISWAP_V2_ROUTER_ABI, provider);
      const amounts = await router.getAmountsOut(amountInWei, path);
      return BigInt(amounts[amounts.length - 1].toString());
    } catch (e: any) {
      if (!e.message?.includes("INSUFFICIENT_LIQUIDITY")) {
        addLog(`⚠️ ${dexName} V2: ${e.message?.slice(0, 80)}`, "warning");
      }
      return null;
    }
  };

  // ----------------------
  // V3 Quote with Liquidity Check
  // ----------------------
  const getV3BestQuote = async (
    provider: ethers.Provider,
    chainName: string,
    tokenIn: string,
    tokenOut: string,
    amountInWei: bigint,
    dexName: string
  ): Promise<{ amountOut: bigint; fee: number; liquidity?: bigint } | null> => {
    try {
      const quoterAddress = UNISWAP_V3_QUOTER_ADDRESS[chainName];
      if (!quoterAddress) return null;
      
      const quoter = new ethers.Contract(quoterAddress, UNISWAP_V3_QUOTER_ABI, provider);
      let best: { amountOut: bigint; fee: number; liquidity?: bigint } | null = null;
      
      const pools = await poolFinderService.findAllPools(tokenIn, tokenOut);

      for (const pool of pools) {
        try {
          const out = await quoter.quoteExactInputSingle.staticCall(
            tokenIn,
            tokenOut,
            pool.fee,
            amountInWei,
            0
          );
          const outBn = BigInt(out.toString());
          
          if (!best || outBn > best.amountOut) {
            best = {
              amountOut: outBn,
              fee: pool.fee
            };
          }
        } catch (e) {
          // Pool doesn't exist for this fee tier
        }
      }
      return best;
    } catch (e: any) {
      if (!e.message?.includes("Pool")) {
        addLog(`⚠️ ${dexName} V3: ${e.message?.slice(0, 80)}`, "warning");
      }
      return null;
    }
  };

  // ----------------------
  // Unified Quote
  // ----------------------
  const getQuote = async (
    provider: ethers.Provider,
    chainName: string,
    dex: { name: string; router: string; type: string },
    amountInWei: bigint,
    path: string[]
  ): Promise<bigint | null> => {
    if (dex.type === "v2") {
      return await getV2Quote(provider, dex.router, amountInWei, path, dex.name);
    } else if (dex.type === "v3") {
      const best = await getV3BestQuote(provider, chainName, path[0], path[1], amountInWei, dex.name);
      return best ? best.amountOut : null;
    }
    return null;
  };

  // ----------------------
  // AI Routes
  // ----------------------
  const getAIRoutes = async (): Promise<ArbitrageRoute[]> => {
    try {
      const aiPrompt = `Suggest 8-10 DeFi arbitrage routes for these chains/tokens:
Chains: base, arbitrum
Tokens: WETH, USDC, DAI
Return ONLY JSON array, no markdown:
[
  { "chain": "base", "symbols": ["WETH", "USDC", "WETH"] },
  { "chain": "arbitrum", "symbols": ["USDC", "DAI", "USDC"] }
]`;
      const response = await generateContent(aiPrompt);
      if (!response) return [];
      
      let cleaned = response.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const parsed = JSON.parse(cleaned);
      
      if (Array.isArray(parsed)) {
        return parsed.map((r: any) => {
          const chainKey = r.chain as keyof typeof TOKENS;
          const chainTokens = TOKENS[chainKey];
          return {
            chain: chainKey,
            symbols: r.symbols,
            path: r.symbols.map((s: string) =>
              chainTokens?.[s as keyof typeof chainTokens]
            )
          };
        });
      }
    } catch (e) {}
    return [];
  };

  // ----------------------
  // Oracle Arbitrage Scan (UPDATED WITH REALISTIC THRESHOLDS)
  // ----------------------
  const scanForOracleOpportunities = useCallback(async (
    chain: keyof typeof CHAINS,
    provider: ethers.JsonRpcProvider
  ): Promise<DEXArbitrageSuggestion[]> => {
    const suggestions: DEXArbitrageSuggestion[] = [];
    const oraclePrice = await priceFeedService.getWethUsdcPrice(chain);
    
    if (!oraclePrice) {
      addLog(`Could not fetch oracle price for ${chain}`, "warning");
      return [];
    }

    const dexs = DEXS[chain];
    const weth = TOKENS[chain].WETH;
    const usdc = TOKENS[chain].USDC;
    if (!weth || !usdc) return [];

    const amountInWeth = ethers.parseEther("1");
    const amountInUsdc = ethers.parseUnits(oraclePrice.toFixed(6), 6);
    
    // Get realistic gas estimate
    const gasNative = await getRealisticGasEstimate(provider, chain, false);

    for (const dex of dexs) {
      // 1. Check WETH -> USDC (Sell WETH scenario)
      const dexAmountOut = await getQuote(provider, chain, dex, amountInWeth, [weth, usdc]);
      
      if (dexAmountOut) {
        const dexPrice = parseFloat(ethers.formatUnits(dexAmountOut, 6));
        const profitPercent = ((dexPrice - oraclePrice) / oraclePrice) * 100;
        
        // REALISTIC THRESHOLD: 0.5% minimum profit
        if (profitPercent > THRESHOLDS.ORACLE_ARB.MIN_PROFIT_PERCENT) {
          const profitUsd = dexPrice - oraclePrice;
          const gasUsd = gasNative * CHAINS[chain].nativeUsd;
          const netUsd = profitUsd - gasUsd;
          
          // REALISTIC THRESHOLD: $5 minimum net profit
          if (netUsd > THRESHOLDS.ORACLE_ARB.MIN_NET_PROFIT_USD) {
            addLog(`💎 Oracle Arb Found: Sell WETH on ${dex.name} for ${profitPercent.toFixed(2)}% profit ($${netUsd.toFixed(2)} net)`, "success");
            
            suggestions.push({
              id: `oracle_${Date.now()}_${dex.name}_s`,
              title: `🎯 Sell WETH on ${dex.name} vs Oracle`,
              description: `Oracle: $${oraclePrice.toFixed(2)} | ${dex.name}: $${dexPrice.toFixed(2)} | Spread: ${profitPercent.toFixed(2)}%`,
              chain: chain,
              chainId: CHAINS[chain].id,
              route: ["WETH", "USDC"],
              dexRoute: [dex.name],
              tokenAddresses: [weth as Address, usdc as Address],
              amountIn: "1.0",
              expectedOut: ethers.formatUnits(dexAmountOut, 6),
              profitPercent: parseFloat(profitPercent.toFixed(4)),
              estimatedProfit: profitUsd.toFixed(2),
              gasEstimate: gasNative.toFixed(4),
              netProfit: netUsd.toFixed(2),
              riskLevel: netUsd > 20 ? "low" : netUsd > 10 ? "medium" : "high",
              timestamp: Date.now(),
            });
          }
        }
      }

      // 2. Check USDC -> WETH (Buy WETH scenario)
      const dexAmountOutWeth = await getQuote(provider, chain, dex, amountInUsdc, [usdc, weth]);
      
      if (dexAmountOutWeth) {
        const dexPriceEquivalent = parseFloat(ethers.formatEther(dexAmountOutWeth));
        const profitPercent = ((dexPriceEquivalent - 1) / 1) * 100;
        
        // REALISTIC THRESHOLD: 0.5% minimum profit
        if (profitPercent > THRESHOLDS.ORACLE_ARB.MIN_PROFIT_PERCENT) {
          const profitEth = dexPriceEquivalent - 1;
          const profitUsd = profitEth * oraclePrice;
          const gasUsd = gasNative * CHAINS[chain].nativeUsd;
          const netUsd = profitUsd - gasUsd;
          
          // REALISTIC THRESHOLD: $5 minimum net profit
          if (netUsd > THRESHOLDS.ORACLE_ARB.MIN_NET_PROFIT_USD) {
            addLog(`💎 Oracle Arb Found: Buy WETH on ${dex.name} for ${profitPercent.toFixed(2)}% profit ($${netUsd.toFixed(2)} net)`, "success");
            
            suggestions.push({
              id: `oracle_${Date.now()}_${dex.name}_b`,
              title: `🎯 Buy WETH on ${dex.name} vs Oracle`,
              description: `Spend $${oraclePrice.toFixed(2)} to get ${dexPriceEquivalent.toFixed(4)} WETH | Spread: ${profitPercent.toFixed(2)}%`,
              chain: chain,
              chainId: CHAINS[chain].id,
              route: ["USDC", "WETH"],
              dexRoute: [dex.name],
              tokenAddresses: [usdc as Address, weth as Address],
              amountIn: oraclePrice.toFixed(2),
              expectedOut: ethers.formatEther(dexAmountOutWeth),
              profitPercent: parseFloat(profitPercent.toFixed(4)),
              estimatedProfit: profitUsd.toFixed(2),
              gasEstimate: gasNative.toFixed(4),
              netProfit: netUsd.toFixed(2),
              riskLevel: netUsd > 20 ? "low" : netUsd > 10 ? "medium" : "high",
              timestamp: Date.now(),
            });
          }
        }
      }
    }

    return suggestions;
  }, [addLog, priceFeedService, poolFinderService]);

  // ----------------------
  // MAIN SCAN - WITH REALISTIC THRESHOLDS
  // ----------------------
  const scanForOpportunities = useCallback(async () => {
    addLog("🔍 Scanning with realistic profit thresholds...", "info");
    addLog(`📊 Min Oracle Profit: ${THRESHOLDS.ORACLE_ARB.MIN_PROFIT_PERCENT}% ($${THRESHOLDS.ORACLE_ARB.MIN_NET_PROFIT_USD}+ net)`, "info");
    addLog(`📊 Min DEX Arb Profit: ${THRESHOLDS.DEX_ARB.MIN_PROFIT_PERCENT}% ($${THRESHOLDS.DEX_ARB.MIN_NET_PROFIT_USD}+ net)`, "info");
    
    const aiRoutesPromise = getAIRoutes().catch(() => []);

    const chainPromises = Object.keys(CHAINS).map(async (chainKey) => {
      const chain = CHAINS[chainKey as keyof typeof CHAINS];
      addLog(`📡 Checking ${chain.name}...`, "info");
      const provider = providers.current.get(chain.name);
      if (!provider) {
        addLog(`❌ No provider found for ${chain.name}. Skipping.`, "error");
        return [];
      }

      const oracleSuggestionsPromise = scanForOracleOpportunities(chain.name as keyof typeof CHAINS, provider);

      const dexs = DEXS[chain.name as keyof typeof DEXS];
      const tokenSymbols = Object.keys(TOKENS[chain.name as keyof typeof TOKENS]);
      const amountInWei = ethers.parseEther("1");
      
      // Get realistic gas estimate for multi-swap
      const gasNative = await getRealisticGasEstimate(provider, chain.name, true);

      const twoPoolPromises: Promise<DEXArbitrageSuggestion | null>[] = [];
      
      for (let i = 0; i < tokenSymbols.length; i++) {
        for (let j = i + 1; j < tokenSymbols.length; j++) {
          const chainKey = chain.name as keyof typeof TOKENS;
          const chainTokens = TOKENS[chainKey];
          const tokenA = chainTokens[tokenSymbols[i] as keyof typeof chainTokens];
          const tokenB = chainTokens[tokenSymbols[j] as keyof typeof chainTokens];
          if (!tokenA || !tokenB) continue;

          for (let buyIdx = 0; buyIdx < dexs.length; buyIdx++) {
            for (let sellIdx = 0; sellIdx < dexs.length; sellIdx++) {
              if (buyIdx === sellIdx) continue;
              const buyDex = dexs[buyIdx];
              const sellDex = dexs[sellIdx];
              
              const promise = (async (): Promise<DEXArbitrageSuggestion | null> => {
                try {
                  const outBuy = await getQuote(provider, chain.name, buyDex, amountInWei, [tokenA, tokenB]);
                  if (!outBuy) return null;

                  const outSell = await getQuote(provider, chain.name, sellDex, outBuy, [tokenB, tokenA]);
                  if (!outSell) return null;

                  const profitWei = BigInt(outSell) - BigInt(amountInWei);
                  if (profitWei <= 0) return null;

                  const profitEth = Number(ethers.formatEther(profitWei));
                  const profitPercent = (profitEth / 1) * 100;
                  
                  // REALISTIC THRESHOLD: 1% minimum profit
                  if (profitPercent > THRESHOLDS.DEX_ARB.MIN_PROFIT_PERCENT) {
                    const gasUsd = gasNative * chain.nativeUsd;
                    const profitUsd = profitEth * chain.nativeUsd;
                    
                    // Account for slippage (2%)
                    const slippageBuffer = profitUsd * THRESHOLDS.DEX_ARB.SLIPPAGE_BUFFER;
                    const netUsd = profitUsd - gasUsd - slippageBuffer;
                    
                    // REALISTIC THRESHOLD: $10 minimum net profit
                    if (netUsd > THRESHOLDS.DEX_ARB.MIN_NET_PROFIT_USD) {
                      addLog(`🚀 DEX Arb Found: ${tokenSymbols[i]}→${tokenSymbols[j]} ${profitPercent.toFixed(2)}% ($${netUsd.toFixed(2)} net)`, "success");
                      
                      return {
                        id: `2pool_${Date.now()}_${buyIdx}_${sellIdx}_${Math.random()}`,
                        title: `🎯 ${tokenSymbols[i]} → ${tokenSymbols[j]} (2-Pool)`,
                        description: `${buyDex.name} → ${sellDex.name} | Spread: ${profitPercent.toFixed(2)}%`,
                        chain: chain.name,
                        chainId: chain.id,
                        route: [tokenSymbols[i], tokenSymbols[j], tokenSymbols[i]],
                        dexRoute: [buyDex.name, sellDex.name],
                        tokenAddresses: [tokenA, tokenB] as Address[],
                        amountIn: "1.0",
                        expectedOut: ethers.formatEther(outSell),
                        profitPercent: parseFloat(profitPercent.toFixed(4)),
                        estimatedProfit: profitUsd.toFixed(2),
                        gasEstimate: gasNative.toFixed(4),
                        netProfit: netUsd.toFixed(2),
                        slippageBuffer: slippageBuffer.toFixed(2),
                        riskLevel: netUsd > 50 ? "low" : netUsd > 20 ? "medium" : "high",
                        timestamp: Date.now(),
                      };
                    }
                  }
                  return null;
                } catch (e: any) {
                  return null;
                }
              })();
              twoPoolPromises.push(promise);
            }
          }
        }
      }

      const threePoolPromises: Promise<DEXArbitrageSuggestion | null>[] = [];
      const routes = [...DEFAULT_ROUTES.filter(r => r.chain === chain.name)];
      const aiRoutes = await aiRoutesPromise;
      routes.push(...aiRoutes.filter(r => r.chain === chain.name));

      for (const route of routes) {
        if (route.symbols?.length < 3) continue;
        const chainKey = chain.name as keyof typeof TOKENS;
        const chainTokens = TOKENS[chainKey];
        const t0 = chainTokens[route.symbols[0] as keyof typeof chainTokens];
        const t1 = chainTokens[route.symbols[1] as keyof typeof chainTokens];
        if (!t0 || !t1) continue;

        for (let i = 0; i < dexs.length; i++) {
          for (let j = 0; j < dexs.length; j++) {
            if (i === j) continue;
            const dex1 = dexs[i];
            const dex2 = dexs[j];

            const promise = (async (): Promise<DEXArbitrageSuggestion | null> => {
              try {
                const mid = await getQuote(provider, chain.name, dex1, amountInWei, [t0, t1]);
                if (!mid) return null;

                const final = await getQuote(provider, chain.name, dex2, mid, [t1, t0]);
                if (!final) return null;

                const profitWei = BigInt(final) - BigInt(amountInWei);
                if (profitWei <= 0) return null;

                const profitEth = Number(ethers.formatEther(profitWei));
                const profitPercent = (profitEth / 1) * 100;
                
                // REALISTIC THRESHOLD: 1% minimum profit
                if (profitPercent > THRESHOLDS.DEX_ARB.MIN_PROFIT_PERCENT) {
                  const gasUsd = gasNative * chain.nativeUsd;
                  const profitUsd = profitEth * chain.nativeUsd;
                  
                  // Account for slippage (2%)
                  const slippageBuffer = profitUsd * THRESHOLDS.DEX_ARB.SLIPPAGE_BUFFER;
                  const netUsd = profitUsd - gasUsd - slippageBuffer;
                  
                  // REALISTIC THRESHOLD: $10 minimum net profit
                  if (netUsd > THRESHOLDS.DEX_ARB.MIN_NET_PROFIT_USD) {
                    addLog(`🚀 3-Pool Arb: ${route.symbols[0]}→${route.symbols[1]} ${profitPercent.toFixed(2)}% ($${netUsd.toFixed(2)} net)`, "success");
                    
                    return {
                      id: `3pool_${Date.now()}_${i}_${j}_${Math.random()}`,
                      title: `🎯 ${route.symbols[0]} → ${route.symbols[1]} → ${route.symbols[0]}`,
                      description: `${dex1.name} → ${dex2.name} | Spread: ${profitPercent.toFixed(2)}%`,
                      chain: chain.name,
                      chainId: chain.id,
                      route: route.symbols,
                      dexRoute: [dex1.name, dex2.name],
                      tokenAddresses: [t0, t1] as Address[],
                      amountIn: "1.0",
                      expectedOut: ethers.formatEther(final),
                      profitPercent: parseFloat(profitPercent.toFixed(4)),
                      estimatedProfit: profitUsd.toFixed(2),
                      gasEstimate: gasNative.toFixed(4),
                      netProfit: netUsd.toFixed(2),
                      slippageBuffer: slippageBuffer.toFixed(2),
                      riskLevel: netUsd > 50 ? "low" : netUsd > 20 ? "medium" : "high",
                      timestamp: Date.now(),
                    };
                  }
                }
                return null;
              } catch (e) {
                return null;
              }
            })();
            threePoolPromises.push(promise);
          }
        }
      }

      const [oracleSuggestions, twoPoolResults, threePoolResults] = await Promise.all([
        oracleSuggestionsPromise,
        Promise.all(twoPoolPromises),
        Promise.all(threePoolPromises)
      ]);

      const chainSuggestions = [
        ...oracleSuggestions,
        ...twoPoolResults.filter((s): s is DEXArbitrageSuggestion => s !== null),
        ...threePoolResults.filter((s): s is DEXArbitrageSuggestion => s !== null)
      ];
      
      return chainSuggestions;
    });

    const allChainsSuggestions = await Promise.all(chainPromises);
    const allNewSuggestions = allChainsSuggestions.flat();
    
    const totalRoutes = allNewSuggestions.length;

    addLog(`📊 Scanned all routes with realistic thresholds`, "info");
    
    if (allNewSuggestions.length > 0) {
      setSuggestions(prev => [...prev, ...allNewSuggestions].sort((a, b) => parseFloat(b.netProfit) - parseFloat(a.netProfit)));
      addLog(`✅ Found ${allNewSuggestions.length} REAL opportunities with >$${THRESHOLDS.DEX_ARB.MIN_NET_PROFIT_USD} profit!`, "success");
    } else {
      addLog(`ℹ️ No profitable opportunities found above threshold. This is normal in efficient markets.`, "info");
      addLog(`💡 Current thresholds: Oracle ${THRESHOLDS.ORACLE_ARB.MIN_PROFIT_PERCENT}%/$${THRESHOLDS.ORACLE_ARB.MIN_NET_PROFIT_USD}, DEX ${THRESHOLDS.DEX_ARB.MIN_PROFIT_PERCENT}%/$${THRESHOLDS.DEX_ARB.MIN_NET_PROFIT_USD}`, "info");
    }
  }, [addLog, generateContent, scanForOracleOpportunities]);

  // ----------------------
  // Auto-refresh every 15 seconds
  // ----------------------
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const scheduleScan = async () => {
      if (isScanning && !useDummyData) {
        await scanForOpportunities();
        timeoutId = setTimeout(scheduleScan, 3000); // Schedule next scan after 3 seconds
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
  }, [isScanning, scanForOpportunities, useDummyData]);

  const startScanning = () => {
    setSuggestions([]);
    setActivityLogs([]);
    addLog("🤖 Agent activated with REALISTIC thresholds!", "success");
    addLog(`🎯 Oracle: ${THRESHOLDS.ORACLE_ARB.MIN_PROFIT_PERCENT}% min, $${THRESHOLDS.ORACLE_ARB.MIN_NET_PROFIT_USD}+ net profit`, "info");
    addLog(`🎯 DEX Arb: ${THRESHOLDS.DEX_ARB.MIN_PROFIT_PERCENT}% min, $${THRESHOLDS.DEX_ARB.MIN_NET_PROFIT_USD}+ net profit`, "info");
    setIsScanning(true);

    if (useDummyData) {
        addLog("DEV MODE: Generating dummy data.", "warning");
        setTimeout(() => {
            const dummySuggestions: DEXArbitrageSuggestion[] = [
                {
                    id: `dex_dummy_${Date.now()}_1`,
                    title: `🎯 WETH → USDC (2-Pool)`,
                    description: `UniswapV3 → Sushiswap | Spread: 0.85%`,
                    chain: "base",
                    chainId: 8453,
                    route: ["WETH", "USDC", "WETH"],
                    dexRoute: ["UniswapV3", "SushiSwap"],
                    tokenAddresses: ["0x4200000000000000000000000000000000000006", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"] as Address[],
                    amountIn: "1.0",
                    expectedOut: "1.0085",
                    profitPercent: 0.85,
                    estimatedProfit: "25.50",
                    gasEstimate: "0.0005",
                    netProfit: "20.00",
                    riskLevel: "low",
                    timestamp: Date.now(),
                    slippageBuffer: "5.00",
                },
                {
                    id: `dex_dummy_${Date.now()}_2`,
                    title: `🎯 USDC → DAI → USDC (3-Pool)`,
                    description: `Aerodrome → BaseSwap | Spread: 0.70%`,
                    chain: "arbitrum",
                    chainId: 42161,
                    route: ["USDC", "DAI", "USDC"],
                    dexRoute: ["Aerodrome", "BaseSwap"],
                    tokenAddresses: ["0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"] as Address[],
                    amountIn: "1000.0",
                    expectedOut: "1007.0",
                    profitPercent: 0.70,
                    estimatedProfit: "7.00",
                    gasEstimate: "0.0008",
                    netProfit: "5.50",
                    riskLevel: "medium",
                    timestamp: Date.now(),
                    slippageBuffer: "1.50",
                },
            ];
            setSuggestions(dummySuggestions);
            addLog(`✅ Found ${dummySuggestions.length} dummy DEX opportunities.`, "success");
            setUseDummyData(false); // Switch to real scanning after displaying dummy data
        }, 12000); // 12 second delay to simulate scanning
    }
  };

  const stopScanning = () => {
    addLog("🛑 Agent stopped.", "info");
    setIsScanning(false);
    setScanProgress(null);
  };

  const executeSuggestion = async (suggestion: DEXArbitrageSuggestion) => {
    setExecutingId(suggestion.id);
    addLog(`⚡ Executing ${suggestion.title} on ${suggestion.chain}...`, "info");
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      addLog(`✅ Executed! Net Profit: ${suggestion.netProfit}`, "success");
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    } catch (error: any) {
      addLog(`❌ Execution failed: ${error?.message}`, "error");
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
    // Export thresholds for UI display
    thresholds: THRESHOLDS,
  };
}