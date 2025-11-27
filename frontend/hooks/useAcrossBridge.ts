import { useMemo } from 'react';
import { createAcrossClient, GetQuoteParams } from '@across-protocol/app-sdk'; // Import GetQuoteParams
import { useWalletClient } from 'wagmi';
import { Address, parseUnits } from 'viem';
import { mainnet, base, arbitrum, optimism, sepolia, baseSepolia } from 'viem/chains';

interface BridgeOptions {
  fromChainId: number;
  toChainId: number;
  inputTokenAddress: Address;
  outputTokenAddress: Address;
  amount: string; // Amount in human-readable format (e.g., "1.5")
  decimals: number; // Token decimals
  isNative: boolean;
  recipient?: Address;
}

interface BridgeProgress {
  step: 'approve' | 'deposit' | 'fill';
  status: 'txSuccess' | 'pending' | 'error';
  txReceipt?: any;
  depositId?: string;
  fillTxTimestamp?: number;
  actionSuccess?: boolean;
}

interface AcrossQuoteAmount {
  value: bigint;
  decimals: number;
}

export interface AcrossQuote {
  outputAmount: AcrossQuoteAmount;
  totalFees: AcrossQuoteAmount;
  eta: number;
  // Add other properties from Across SDK quote as needed
}

export const useAcrossBridge = () => {
  const { data: walletClient } = useWalletClient();

  // Initialize the modern Across client
  const client = useMemo(() => {
    return createAcrossClient({
      integratorId: "0x00b2", // TEMPORARY: Replace with your actual integrator ID (2 bytes hex string, e.g., 0x0001)
      chains: [mainnet, base, arbitrum, optimism, sepolia, baseSepolia],
    });
  }, []);

  const getBridgeQuote = async (options: BridgeOptions) => {
    const { fromChainId, toChainId, inputTokenAddress, outputTokenAddress, amount, decimals, isNative } = options;
    const testnetApiUrl = 'https://testnet.across.to/api';
    const testnetIds: number[] = [sepolia.id, baseSepolia.id];
    const isTestnet = testnetIds.includes(fromChainId);
    const apiUrl = isTestnet ? testnetApiUrl : undefined;

    const parsedAmount = parseUnits(amount, decimals);

    // Explicitly type the parameters object to get detailed TypeScript errors
    const quoteParams: GetQuoteParams = {
      route: {
        originChainId: fromChainId,
        destinationChainId: toChainId,
        inputToken: inputTokenAddress,
        outputToken: outputTokenAddress,
        isNative,
      },
      inputAmount: parsedAmount,
      apiUrl,
    };

    const quote = await client.getQuote(quoteParams) as any; // Cast to any temporarily

    console.log("Across SDK Quote Object:", quote); // Temporary log to inspect structure

    return quote;
  };

  const executeBridge = async (
    options: BridgeOptions,
    onProgress?: (progress: BridgeProgress) => void,
  ) => {
    if (!walletClient) throw new Error('Wallet not connected');

    const { fromChainId, toChainId, inputTokenAddress, outputTokenAddress, amount, decimals, isNative, recipient } = options;

    const testnetApiUrl = 'https://testnet.across.to/api';
    const testnetIds: number[] = [sepolia.id, baseSepolia.id];
    const isTestnet = testnetIds.includes(fromChainId);
    const apiUrl = isTestnet ? testnetApiUrl : undefined;

    const parsedAmount = parseUnits(amount, decimals);

    // Get quote first
    const quote = await client.getQuote({
      route: {
        originChainId: fromChainId,
        destinationChainId: toChainId,
        inputToken: inputTokenAddress,
        outputToken: outputTokenAddress,
        isNative,
      },
      inputAmount: parsedAmount,
      apiUrl,
    }) as any; // Cast to any temporarily

    // Execute the quote - this handles approval + deposit + fill automatically
    await client.executeQuote({
      walletClient: walletClient,
      deposit: {
        ...quote.deposit,
        recipient: recipient || walletClient.account?.address || null,
      },
      onProgress: (progress) => {
        if (progress.step === "approve" && progress.status === "txSuccess") {
          console.log("Approval successful", progress.txReceipt);
        }
        
        if (progress.step === "deposit" && progress.status === "txSuccess") {
          console.log("Deposit successful", { depositId: progress.depositId, txReceipt: progress.txReceipt });
        }
        
        if (progress.step === "fill" && progress.status === "txSuccess") {
          console.log("Fill successful", { 
            fillTxTimestamp: progress.fillTxTimestamp, 
            txReceipt: progress.txReceipt,
            actionSuccess: progress.actionSuccess 
          });
        }

        // Call custom progress handler if provided
        if (onProgress) {
          onProgress(progress as BridgeProgress);
        }
      },
    });
  };

  const getSupportedChains = async (chainId?: number) => {
    if (chainId) {
      return await client.getSupportedChains({ chainId });
    }
    return await client.getSupportedChains({});
  };

  return {
    client,
    getBridgeQuote,
    executeBridge,
    getSupportedChains,
  };
};