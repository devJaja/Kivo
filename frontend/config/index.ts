

export const BASE_URL = process.env.BASE_URL;

// ----------------------
// Chains
// ----------------------
export const CHAINS = {
  base: {
    name: "base",
    id: 8453,
    rpc: process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org",
    nativeUsd: 3000, // Estimated price of ETH for gas calculation
  },
  arbitrum: {
    name: "arbitrum",
    id: 42161,
    rpc: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc",
    nativeUsd: 3000, // Estimated price of ETH for gas calculation
  },
};

// ----------------------
// Tokens
// ----------------------
export const TOKENS = {
  base: {
    WETH: "0x4200000000000000000000000000000000000006",
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    USDT: "0x4200000000000000000000000000000000000022",
    cbETH: "0x2Ae3F1Ee830728329b35b62b18600c43C12b6f12",
  },
  arbitrum: {
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    USDT: "0xFd086bc7Cd5c481Dcc9C85ebE478A1C0b69fBb66",
    ARB: "0x912CE59144191C1204E64559FE8253a0e49E6548",
  },
};

// ----------------------
// DEXs
// ----------------------
export const DEXS = {
  base: [
    { name: "Aerodrome", router: "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43", type: "v2" },
    { name: "BaseSwap", router: "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86", type: "v2" },
    { name: "UniswapV3", router: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a", type: "v3" },
    { name: "SushiSwap", router: "0x0283f2a179a34E54D4c315044A1e5285d32379a5", type: "v2" },
    { name: "PancakeSwapV3", router: "0x1B898eA3f0337A486d792033c4155106e232A4C2", type: "v3" },
  ],
  arbitrum: [
    { name: "SushiSwap", router: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", type: "v2" },
    { name: "Camelot", router: "0xc873fEcbd354f5A56E00E710B90EF4201db2448d", type: "v2" },
    { name: "UniswapV3", router: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6", type: "v3" },
    { name: "QuickswapV3", router: "0xA5E0829CaCEd8fFDD4De3c43696c57f7D7E6D4AD", type: "v3" },
  ],
};

// ----------------------
// Uniswap V3 Specifics
// ----------------------
export const UNISWAP_V3_QUOTER_ADDRESS: Record<string, string> = {
  base: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a", // Uniswap Universal Router on Base
  arbitrum: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6", // QuoterV2 on Arbitrum
};
export const V3_FEE_TIERS = [100, 500, 3000, 10000]; // Added 100 bps tier

// ----------------------
// Pyth Oracle
// ----------------------
export const PYTH_CONFIG = {
  endpoint: process.env.NEXT_PUBLIC_HERMES_ENDPOINT || "https://hermes.pyth.network",
  priceIds: {
    // Pyth Price Feed IDs
    "WETH/USDC": {
      base: "0xf9c0172ba10dfa4d1908c7d3609b5de259d5e474ade783fdd674ca740f49da54", // ETH/USD on Base
      arbitrum: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", // ETH/USD on Arbitrum
    },
  },
};


// ----------------------
// Arbitrage Routes
// ----------------------
export const DEFAULT_ROUTES = [
    // Base
  { chain: "base", symbols: ["WETH", "USDC", "WETH"] },
  { chain: "base", symbols: ["WETH", "DAI", "WETH"] },
  { chain: "base", symbols: ["USDC", "WETH", "USDC"] },
  // Arbitrum
  { chain: "arbitrum", symbols: ["WETH", "USDC", "WETH"] },
  { chain: "arbitrum", symbols: ["WETH", "DAI", "WETH"] },
  { chain: "arbitrum", symbols: ["USDC", "WETH", "USDC"] },
];

// Legacy config for reference (can be removed later)
export const config = {
  USDC: TOKENS.base.USDC,
  WETH: process.env.WETH, // This should probably be TOKENS.base.WETH
  UNISWAP_ROUTER: DEXS.base.find(d => d.name === "UniswapV3")?.router,
  SUSHI_SWAP_ROUTER: DEXS.base.find(d => d.name === "SushiSwap")?.router,
  HERMES_ENDPOINT: PYTH_CONFIG.endpoint,
  WETH_USDC_ID: PYTH_CONFIG.priceIds["WETH/USDC"].base,
  UNISWAP_V3_FACTORY: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD", // Uniswap V3 Factory on Base
  RPC_URL: CHAINS.base.rpc,
};

console.log("Sushiswap Router on Base:", config.SUSHI_SWAP_ROUTER);