// src/wagmiConfig.ts
import { createConfig } from '@privy-io/wagmi';
import { mainnet, sepolia, baseSepolia } from 'viem/chains';
import { http } from 'wagmi';

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, baseSepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [baseSepolia.id]: http("https://sepolia.base.org"), // Explicitly define Base Sepolia RPC URL
  },
});
