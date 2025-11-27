import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ChevronDown, ArrowDownUp, AlertCircle, Loader2 } from 'lucide-react';
import { useAcrossBridge } from '@/hooks/useAcrossBridge'; // Import the hook
import { parseUnits, Address, formatUnits } from 'viem';
import { mainnet, base, arbitrum, optimism, baseSepolia, sepolia } from 'viem/chains';
import { RealTimePriceOracle } from '@/lib/priceOracle';

const priceOracle = new RealTimePriceOracle();

const isRouteKnownBroken = (fromChain: number, toChain: number, isNative: boolean) => {
  // Known broken routes on testnet
  const brokenRoutes = [
    { from: sepolia.id, to: baseSepolia.id, native: true },
    { from: baseSepolia.id, to: sepolia.id, native: true },
  ];
  
  return brokenRoutes.some(
    route => route.from === fromChain && route.to === toChain && route.native === isNative
  );
};

const AcrossBridge = () => {
  const { address, chainId } = useAccount();
  const { getBridgeQuote, executeBridge } = useAcrossBridge(); // Use the modern hook

  const bigIntReplacer = (key: string, value: any) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  };

  // Supported chains configuration
  const CHAINS = [
    { id: mainnet.id, name: mainnet.name, shortName: 'ETH', chain: mainnet },
    { id: base.id, name: base.name, shortName: 'Base', chain: base },
    { id: arbitrum.id, name: arbitrum.name, shortName: 'Arbitrum', chain: arbitrum },
    { id: optimism.id, name: optimism.name, shortName: 'Optimism', chain: optimism },
    { id: baseSepolia.id, name: baseSepolia.name, shortName: 'Base Sepolia', chain: baseSepolia },
    { id: sepolia.id, name: "Ethereum Sepolia", shortName: 'ETH Sepolia', chain: sepolia },
  ];

  // Internal representation of tokens, will be populated with addresses and decimals
  interface TokenConfig {
    symbol: string;
    name: string;
    decimals: number;
    address: Address;
    isNative: boolean;
  }

  // State management
  const [fromChain, setFromChain] = useState(CHAINS.find(c => c.id === mainnet.id) || CHAINS[0]);
  const [toChain, setToChain] = useState(CHAINS.find(c => c.id === base.id) || CHAINS[1]);
  const [selectedToken, setSelectedToken] = useState<TokenConfig | null>(null);
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<any>(null); // Use any for now, refine later
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isBridging, setIsBridging] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const [allTokensConfig, setAllTokensConfig] = useState<Record<number, TokenConfig[]>>({});

  // Dropdown states
  const [showFromChainDropdown, setShowFromChainDropdown] = useState(false);
  const [showToChainDropdown, setShowToChainDropdown] = useState(false);
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);

  // Initialize token configurations for all chains
  useEffect(() => {
    const newAllTokensConfig: Record<number, TokenConfig[]> = {};

    CHAINS.forEach(chain => {
      const supportedSymbols = priceOracle.getSupportedTokens(chain.id.toString());
      const tokensForChain: TokenConfig[] = [];

      // Add native ETH/WETH
      tokensForChain.push({
        symbol: chain.chain.nativeCurrency.symbol,
        name: chain.chain.nativeCurrency.name,
        decimals: chain.chain.nativeCurrency.decimals,
        address: '0x0000000000000000000000000000000000000000', // ETH is 0 address for native
        isNative: true,
      });

      supportedSymbols.forEach(symbol => {
        const address = priceOracle.getTokenAddress(chain.id.toString(), symbol) as Address;
        // Skip if address is '0x0' which indicates ETH if it's not the native token we added
        if (address && address !== '0x0000000000000000000000000000000000000000') {
          // You might need to fetch decimals for these ERC20s if not hardcoded in oracle
          // For now, assume common decimals (e.g., USDC 6, DAI 18, USDT 6) or fetch
          let decimals = 18; // Default for many
          if (symbol === 'USDC' || symbol === 'USDT') decimals = 6;

          tokensForChain.push({
            symbol,
            name: symbol, // Can improve with full name
            decimals,
            address,
            isNative: false,
          });
        }
      });
      newAllTokensConfig[chain.id] = tokensForChain;
    });
    setAllTokensConfig(newAllTokensConfig);

    // Set initial selected token for the fromChain
    const defaultFromChain = CHAINS.find(c => c.id === mainnet.id) || CHAINS[0];
    const defaultToken = newAllTokensConfig[defaultFromChain.id]?.find(t => t.symbol === 'WETH') || newAllTokensConfig[defaultFromChain.id]?.[0] || null;
    setSelectedToken(defaultToken);
  }, []);

  // Update selected token when fromChain changes if current token not available
  useEffect(() => {
    if (allTokensConfig[fromChain.id] && selectedToken) {
      const availableTokens = allTokensConfig[fromChain.id];
      const tokenExists = availableTokens.some(token => token.symbol === selectedToken.symbol);
      if (!tokenExists) {
        setSelectedToken(availableTokens[0] || null);
      }
    }
  }, [fromChain.id, allTokensConfig, selectedToken]);

  // Switch chains
  const handleSwitchChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
    setQuote(null);
  };

  // Get quote from Across
  const getAcrossQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setQuote(null);
      return;
    }
    if (!address) {
      setError('Please connect your wallet');
      return;
    }
    if (!selectedToken || !selectedToken.address) {
      setError('Please select a token with a valid address.');
      return;
    }

    if (isRouteKnownBroken(fromChain.id, toChain.id, selectedToken.isNative)) {
      setError('This route is temporarily unavailable due to testnet configuration. Please try WETH or different chains.');
      setQuote(null);
      return;
    }

    setIsLoadingQuote(true);
    setError('');
    setQuote(null); // Clear previous quote

    const outputTokenAddress = selectedToken.isNative
      ? priceOracle.getTokenAddress(toChain.id.toString(), 'WETH') as Address
      : priceOracle.getTokenAddress(toChain.id.toString(), selectedToken.symbol) as Address;

    let bridgeQuote: any = null;
    try {
      bridgeQuote = await getBridgeQuote({
        fromChainId: fromChain.id,
        toChainId: toChain.id,
        inputTokenAddress: selectedToken.address,
        outputTokenAddress: outputTokenAddress || selectedToken.address, // fallback to same address
        isNative: selectedToken.isNative,
        amount: amount,
        decimals: selectedToken.decimals,
      });

      if (!bridgeQuote.deposit || !bridgeQuote.fees) {
        setError('Failed to get bridge quote: invalid quote response. ' + JSON.stringify(bridgeQuote, bigIntReplacer));
        return;
      }

      setQuote({
        receiveAmountFormatted: formatUnits(bridgeQuote.deposit.outputAmount, selectedToken.decimals),
        estimatedFeeFormatted: formatUnits(bridgeQuote.fees.totalRelayFee.total, selectedToken.decimals),
        eta: bridgeQuote.estimatedFillTimeSec,
      });
    } catch (err: any) {
      setError('Failed to get quote: ' + (err.message || err.toString()) + ' ' + JSON.stringify(bridgeQuote, bigIntReplacer));
      console.error('Quote error:', err);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  // Debounce quote fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      if (amount && parseFloat(amount) > 0) {
        getAcrossQuote();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [amount, fromChain, toChain, selectedToken, address]); // Added address to dependencies

  // Execute bridge transaction
  const handleAcrossBridge = async () => {
    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!quote) {
      setError('Please get a bridge quote first.');
      return;
    }

    if (!selectedToken || !selectedToken.address) {
      setError('Selected token details are incomplete.');
      return;
    }

    if (chainId !== fromChain.id) {
      setError(`Please switch your wallet to ${fromChain.name} (${fromChain.id}) to bridge from this chain.`);
      return;
    }

    if (isRouteKnownBroken(fromChain.id, toChain.id, selectedToken.isNative)) {
      setError('This route is temporarily unavailable due to testnet configuration. Please try WETH or different chains.');
      return;
    }

    setIsBridging(true);
    setError('');
    setTxHash('');

    const outputTokenAddress = selectedToken.isNative
      ? priceOracle.getTokenAddress(toChain.id.toString(), 'WETH') as Address
      : priceOracle.getTokenAddress(toChain.id.toString(), selectedToken.symbol) as Address;

    try {
      await executeBridge({
        fromChainId: fromChain.id,
        toChainId: toChain.id,
        inputTokenAddress: selectedToken.address,
        outputTokenAddress: outputTokenAddress || selectedToken.address,
        isNative: selectedToken.isNative,
        amount: amount,
        decimals: selectedToken.decimals,
        recipient: address,
      }, (progress) => {
        console.log("Bridge Progress:", progress);
        // You can update UI based on progress here
        if (progress.step === 'fill' && progress.status === 'txSuccess' && progress.txReceipt) {
          setTxHash(progress.txReceipt.transactionHash);
        }
      });

      setAmount('');
      setQuote(null);
      // setTxHash is handled by the onProgress callback if fill is successful
      
      alert('Bridge transaction submitted successfully! Check your wallet for status.');
    } catch (err: any) {
      setError('Bridge transaction failed: ' + (err.message || err.toString()));
      console.error('Bridge error:', err);
    } finally {
      setIsBridging(false);
    }
  };



  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Bridge Assets</h2>

      {/* From Chain */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
        <div className="relative">
          <button
            onClick={() => setShowFromChainDropdown(!showFromChainDropdown)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-900">{fromChain.name}</span>
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </button>
          {showFromChainDropdown && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
              {CHAINS.filter(c => c.id !== toChain.id).map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => {
                    setFromChain(chain);
                    setShowFromChainDropdown(false);
                    setQuote(null);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                >
                  {chain.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Switch Button */}
      <div className="flex justify-center -my-2 relative z-0">
        <button
          onClick={handleSwitchChains}
          className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors shadow-md"
        >
          <ArrowDownUp className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* To Chain */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
        <div className="relative">
          <button
            onClick={() => setShowToChainDropdown(!showToChainDropdown)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-900">{toChain.name}</span>
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </button>
          {showToChainDropdown && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
              {CHAINS.filter(c => c.id !== fromChain.id).map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => {
                    setToChain(chain);
                    setShowToChainDropdown(false);
                    setQuote(null);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                >
                  {chain.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Token Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Token</label>
        <div className="relative">
          <button
            onClick={() => setShowTokenDropdown(!showTokenDropdown)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-900">{selectedToken?.symbol || 'Select Token'}</span>
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </button>
          {showTokenDropdown && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
              {allTokensConfig[fromChain.id]?.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => {
                    setSelectedToken(token);
                    setShowTokenDropdown(false);
                    setQuote(null);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                >
                  <div className="font-medium text-gray-900">{token.symbol}</div>
                  <div className="text-sm text-gray-500">{token.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          step="0.000001"
          min="0"
        />
      </div>

      {/* Quote Display */}
      {isLoadingQuote && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin mr-2" />
          <span className="text-blue-700">Getting quote...</span>
        </div>
      )}

      {quote && !isLoadingQuote && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">You will receive</span>
            <span className="font-semibold text-gray-900">
              {quote.receiveAmountFormatted} {selectedToken?.symbol}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estimated fee</span>
            <span className="text-gray-900">{quote.estimatedFeeFormatted} {selectedToken?.symbol}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estimated time</span>
            <span className="text-gray-900">{quote.eta ? `${Math.ceil(quote.eta / 60)} minutes` : 'N/A'}</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* Success Display */}
      {txHash && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg">
          <div className="text-green-700 text-sm font-medium mb-1">Transaction submitted!</div>
          <div className="text-green-600 text-xs break-all">Hash: {txHash}</div>
        </div>
      )}

      {/* Bridge Button */}
      <button
        onClick={handleAcrossBridge}
        disabled={!address || !amount || parseFloat(amount) <= 0 || isBridging || isLoadingQuote || !quote}
        className="w-full py-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {isBridging ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Bridging...
          </>
        ) : (
          'Bridge'
        )}
      </button>

      {!address && (
        <p className="mt-4 text-center text-sm text-gray-500">
          Please connect your wallet to start bridging
        </p>
      )}
    </div>
  );
};

export default AcrossBridge;