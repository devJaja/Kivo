// src/wagmiConfig.ts
import { createConfig } from '@privy-io/wagmi';
import { mainnet, sepolia, base, arbitrum, optimism, baseSepolia } from 'viem/chains';
import { http } from 'wagmi';

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, base, arbitrum, optimism, baseSepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http("https://mainnet.base.org"),
    [arbitrum.id]: http("https://arb1.arbitrum.io/rpc"),
    [optimism.id]: http("https://mainnet.optimism.io"),
    [baseSepolia.id]: http("https://sepolia.base.org"), // Explicitly define Base Sepolia RPC URL
  },
});
