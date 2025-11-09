"use client"

import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { createAlchemySmartAccountClient } from '@alchemy/aa-alchemy';
import { WalletClientSigner } from '@alchemy/aa-core';
import { sepolia } from 'viem/chains';
import { createContext, useContext, useEffect, useState } from 'react';
import { createWalletClient, custom } from 'viem';

const SmartAccountContext = createContext<{ smartAccount: any | null }>({
  smartAccount: null,
});

export const useSmartAccount = () => {
  return useContext(SmartAccountContext);
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        loginMethods: ['email', 'google', 'twitter', 'wallet'],
        appearance: { theme: 'light' },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          }
        },
      }}
    >
      <AlchemyAccountProvider>
        {children}
      </AlchemyAccountProvider>
    </PrivyProvider>
  );
}

function AlchemyAccountProvider({ children }: { children: React.ReactNode }) {
  const { user, authenticated } = usePrivy();
  const [smartAccount, setSmartAccount] = useState<any | null>(null);

  useEffect(() => {
    if (authenticated && user && user.wallet) {
      createSmartAccount();
    }
  }, [authenticated, user]);

  const createSmartAccount = async () => {
    const privyEmbeddedProvider = user.wallet.getEthereumProvider();
    const privyWalletClient = createWalletClient({
      transport: custom(privyEmbeddedProvider),
    });
    const privySigner = new WalletClientSigner(privyWalletClient, 'privy');

    const chain = sepolia;
    const alchemyRpcUrl = `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;

    const client = await createAlchemySmartAccountClient({
      chain,
      owner: privySigner,
      rpcUrl: alchemyRpcUrl,
      entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    });

    setSmartAccount(client);
  };

  return (
    <SmartAccountContext.Provider value={{ smartAccount }}>
      {children}
    </SmartAccountContext.Provider>
  );
}