import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/wallet-store';
import { parseUnits } from 'viem';
import { Token, TradeType, CurrencyAmount } from '@uniswap/sdk-core';
import { Pool, Route, Trade } from '@uniswap/v3-sdk';
import { abi as QuoterABI } from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';

const QUOTER_CONTRACT_ADDRESS_RAW = '0xC5290058841028F1614F3A6F0F5816cAd0df5E27'; // Uniswap V3 Quoter Address on Base Sepolia

export interface UniswapQuote {
  trade: Trade<Token, Token, typeof TradeType.EXACT_INPUT>;
  buyAmount: string;
}

export function useUniswapQuote(fromToken: string, toToken: string, fromAmount: string) {
  const [quote, setQuote] = useState<UniswapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activeChain } = useWalletStore();
  const [quoterContractAddress, setQuoterContractAddress] = useState<string | null>(null);
  const [ethersInstance, setEthersInstance] = useState<any>(null);
  const [providerInstance, setProviderInstance] = useState<any>(null);

  useEffect(() => {
    import('ethers').then((ethersModule) => {
      setEthersInstance(ethersModule);
      const newProvider = new ethersModule.JsonRpcProvider('https://base-sepolia.g.alchemy.com/v2/6fFydCiCA2n-hK5XKz5A6');
      setProviderInstance(newProvider);
      try {
        const checksummedAddress = ethersModule.getAddress(QUOTER_CONTRACT_ADDRESS_RAW);
        setQuoterContractAddress(checksummedAddress);
        console.log("Checksummed Quoter Address:", checksummedAddress);
      } catch (e: unknown) {
        console.error("Error checksumming QUOTER_CONTRACT_ADDRESS:", e);
        if (e instanceof Error) {
          setError(`Failed to initialize Uniswap Quoter address: ${e.message}`);
        } else {
          setError("Failed to initialize Uniswap Quoter address: An unknown error occurred.");
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!fromAmount || !fromToken || !toToken || Number(fromAmount) <= 0 || !quoterContractAddress || !ethersInstance || !providerInstance) {
      setQuote(null);
      return;
    }

    const fetchQuote = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const tokenAddresses: Record<string, { address: string, decimals: number }> = {
            "ETH": { address: "0x4200000000000000000000000000000000000006", decimals: 18 }, // WETH on Base Sepolia
            "USDC": { address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", decimals: 6 }, // USDC on Base Sepolia
            "DAI": { address: "0x48c332cAB8a3C745576d729d9819D337B1a58571", decimals: 18 }, // DAI on Base Sepolia
        };

        const fromTokenInfo = tokenAddresses[fromToken];
        const toTokenInfo = tokenAddresses[toToken];

        if (!fromTokenInfo || !toTokenInfo) {
          throw new Error("Invalid token selected");
        }

        const tokenIn = new Token(parseInt(activeChain), fromTokenInfo.address, fromTokenInfo.decimals);
        const tokenOut = new Token(parseInt(activeChain), toTokenInfo.address, toTokenInfo.decimals);

        const quoterContract = new ethersInstance.Contract(quoterContractAddress, QuoterABI, providerInstance);
        const amountIn = parseUnits(fromAmount, fromTokenInfo.decimals).toString();

        const quotedAmountOut = await quoterContract.quoteExactInputSingle.staticCall(
            tokenIn.address,
            tokenOut.address,
            3000, // Fee tier
            amountIn,
            0
        );

        const trade = await Trade.createUncheckedTrade({
            route: new Route([new Pool(tokenIn, tokenOut, 3000, "0", "0", 0)], tokenIn, tokenOut),
            inputAmount: CurrencyAmount.fromRawAmount(tokenIn, amountIn),
            outputAmount: CurrencyAmount.fromRawAmount(tokenOut, quotedAmountOut),
            tradeType: TradeType.EXACT_INPUT,
        });

        setQuote({
            trade,
            buyAmount: quotedAmountOut.toString(),
        });

      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching the quote.");
        }
        setQuote(null);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounce);

  }, [fromAmount, fromToken, toToken, activeChain, quoterContractAddress, ethersInstance, providerInstance]);

  return { quote, isLoading, error };
}
