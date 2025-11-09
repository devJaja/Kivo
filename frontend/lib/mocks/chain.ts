export const MOCK_CHAINS_DATA = [
  {
    id: "base",
    name: "Base",
    icon: "⬢",
    nativeToken: "ETH",
    blockExplorer: "https://basescan.org",
  },
  {
    id: "optimism",
    name: "Optimism",
    icon: "◈",
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

export const MOCK_TOKENS_BY_CHAIN: Record<string, string[]> = {
  base: ["ETH", "USDC", "DAI", "USDbC"],
  optimism: ["ETH", "USDC", "OP", "SNX"],
  arbitrum: ["ETH", "USDC", "ARB", "GMX"],
  polygon: ["MATIC", "USDC", "AAVE", "LINK"],
}
