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
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
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
