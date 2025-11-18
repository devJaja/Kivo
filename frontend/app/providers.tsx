"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/hooks/wagmiConfig";
import { privyConfig } from "@/hooks/privyConfig";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { useWalletStore } from "@/store/wallet-store";

const queryClient = new QueryClient();

function TransactionFetcher() {
  const { account } = useWalletStore();
  useTransactionHistory(account?.address);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!privyAppId) {
    throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set. Please add it to your .env.local file.");
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={privyConfig}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <TransactionFetcher />
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
