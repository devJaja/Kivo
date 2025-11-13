import React, { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { ChevronDown, ArrowDownUp, AlertCircle, Loader2 } from 'lucide-react';

// Installation instructions:
// npm install @across-protocol/app-sdk viem

// Import the Across SDK (add this at the top of your actual file)
// import { across } from '@across-protocol/app-sdk';

const AcrossBridge = () => {
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Supported chains configuration
  const CHAINS = [
    { id: 11155111, name: 'Ethereum Sepolia', shortName: 'ETH Sepolia' },
    { id: 8453, name: 'Base', shortName: 'Base' },
    { id: 84532, name: 'Base Sepolia', shortName: 'Base Sepolia' },
    { id: 42161, name: 'Arbitrum One', shortName: 'Arbitrum' },
  ];

  // Supported tokens
  const TOKENS = [
    { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { symbol: 'USDT', name: 'Tether', decimals: 6 },
  ];

  interface Quote {
    estimatedFee: string;
    receiveAmount: string;
    estimatedTime: string;
  }

  // State management
  const [fromChain, setFromChain] = useState(CHAINS[0]);
  const [toChain, setToChain] = useState(CHAINS[1]);
  const [selectedToken, setSelectedToken] = useState(TOKENS[0]);
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isBridging, setIsBridging] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  // Dropdown states
  const [showFromChainDropdown, setShowFromChainDropdown] = useState(false);
  const [showToChainDropdown, setShowToChainDropdown] = useState(false);
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);

  // Switch chains
  const handleSwitchChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
    setQuote(null);
  };

  // Get quote from Across
  const getQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setQuote(null);
      return;
    }

    setIsLoadingQuote(true);
    setError('');

    try {
      // This is a placeholder for the actual Across SDK quote call
      // In production, you would use:
      // const quote = await across.getQuote({
      //   originChainId: fromChain.id,
      //   destinationChainId: toChain.id,
      //   token: selectedToken.symbol,
      //   amount: parseUnits(amount, selectedToken.decimals),
      //   recipient: address,
      // });

      // Simulated quote for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const estimatedFee = (parseFloat(amount) * 0.001).toFixed(6); // 0.1% fee estimate
      const receiveAmount = (parseFloat(amount) - parseFloat(estimatedFee)).toFixed(6);

      setQuote({
        estimatedFee,
        receiveAmount,
        estimatedTime: '1-3 minutes',
      });
    } catch (err) {
      setError('Failed to get quote. Please try again.');
      console.error('Quote error:', err);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  // Debounce quote fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      if (amount && parseFloat(amount) > 0) {
        getQuote();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [amount, fromChain, toChain, selectedToken]);

  // Execute bridge transaction
  const handleBridge = async () => {
    if (!address || !walletClient) {
      setError('Please connect your wallet');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsBridging(true);
    setError('');
    setTxHash('');

    try {
      // This is a placeholder for the actual Across SDK bridge call
      // In production, you would use:
      // 
      // const bridge = await across.bridge({
      //   originChainId: fromChain.id,
      //   destinationChainId: toChain.id,
      //   token: selectedToken.symbol,
      //   amount: parseUnits(amount, selectedToken.decimals),
      //   recipient: address,
      //   walletClient,
      // });
      // 
      // setTxHash(bridge.hash);

      // Simulated transaction for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const simulatedTxHash = '0x' + Array(64).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      setTxHash(simulatedTxHash);
      setAmount('');
      setQuote(null);
      
      alert('Bridge transaction submitted successfully!');
    } catch (err) {
      setError('Bridge transaction failed. Please try again.');
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
            <span className="font-medium text-gray-900">{selectedToken.symbol}</span>
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </button>
          {showTokenDropdown && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
              {TOKENS.map((token) => (
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
              {quote.receiveAmount} {selectedToken.symbol}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estimated fee</span>
            <span className="text-gray-900">{quote.estimatedFee} {selectedToken.symbol}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estimated time</span>
            <span className="text-gray-900">{quote.estimatedTime}</span>
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
        onClick={handleBridge}
        disabled={!address || !amount || parseFloat(amount) <= 0 || isBridging || isLoadingQuote}
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