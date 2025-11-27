// src/privyConfig.ts
import type { PrivyClientConfig } from '@privy-io/react-auth'
import { base, arbitrum, optimism, baseSepolia, mainnet, sepolia } from 'viem/chains'

export const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: 'light',
    accentColor: '#6366F1',
  },
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'users-without-wallets',
    },
  },
  supportedChains: [mainnet, sepolia, base, arbitrum, optimism, baseSepolia],
}