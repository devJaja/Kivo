import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { X, ArrowRightLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUniswapQuote } from "@/hooks/useUniswapQuote"
import { useWalletStore } from "@/store/wallet-store"
import { useWalletClient, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi"
import { erc20Abi, formatUnits, parseUnits } from "viem"
import { SwapRouter } from "@uniswap/v3-sdk"
import { Token } from "@uniswap/sdk-core"

const UNISWAP_ROUTER_ADDRESS = "0x2626664c2603336E57B271c5C0b26F421741e481" // Uniswap V3 Router on Base Sepolia

interface SwapModalProps {
  onClose: () => void
}

export default function SwapModal({ onClose }: SwapModalProps) {
  const [fromToken, setFromToken] = useState("ETH")
  const [toToken, setToToken] = useState("USDC")
  const [fromAmount, setFromAmount] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [approvalTxHash, setApprovalTxHash] = useState<`0x${string}` | undefined>(undefined)
  const [swapTxHash, setSwapTxHash] = useState<`0x${string}` | undefined>(undefined)

  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const { balances, account, activeChain } = useWalletStore()
  const { quote, isLoading: isQuoteLoading, error: quoteError } = useUniswapQuote(fromToken, toToken, fromAmount)

  const { isLoading: isConfirmingApproval, isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({ hash: approvalTxHash })
  const { isLoading: isConfirmingSwap, isSuccess: isSwapConfirmed } = useWaitForTransactionReceipt({ hash: swapTxHash })

  const toAmount = quote ? formatUnits(BigInt(quote.buyAmount), toToken === 'ETH' ? 18 : 6) : ""

  useEffect(() => {
    if (isSwapConfirmed) {
      console.log("Swap confirmed!")
      onClose()
    }
  }, [isSwapConfirmed, onClose])

  const handleSwap = useCallback(async (isApproved = false) => {
    if (!quote || !walletClient || !account) return

    setError(null)
    setIsSwapping(true)

    try {
      const tokenBalance = balances[activeChain]?.[fromToken]
      if (!tokenBalance || parseFloat(tokenBalance) < parseFloat(fromAmount)) {
        throw new Error("Insufficient balance")
      }

      if (fromToken !== "ETH" && !isApproved) {
        if (!publicClient) {
          throw new Error("Public client not available.");
        }
        console.log("Checking allowance...")
        const fromTokenAddress = (quote.trade.route.tokenPath[0] as Token).address
        const allowance = await publicClient.readContract({
          address: fromTokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "allowance",
          args: [account.address as `0x${string}`, UNISWAP_ROUTER_ADDRESS as `0x${string}`],
        })
        console.log("Allowance:", allowance)

        const fromAmountWei = parseUnits(fromAmount, fromToken === 'ETH' ? 18 : 6)

        if (allowance < fromAmountWei) {
          console.log("Allowance insufficient, requesting approval...")
          setIsApproving(true)
          const approvalHash = await writeContractAsync({
            address: fromTokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "approve",
            args: [UNISWAP_ROUTER_ADDRESS as `0x${string}`, fromAmountWei],
          })
          console.log("Approval transaction sent:", approvalHash)
          setApprovalTxHash(approvalHash)
          setIsSwapping(false)
          return
        }
      }

      console.log("Proceeding with swap...")
      const { calldata, value } = SwapRouter.swapCallParameters(quote.trade, {
        slippageTolerance: new (await import('@uniswap/sdk-core')).Percent(50, 10_000), // 0.5%
        recipient: account.address,
        deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from now
      })

      const txHash = await walletClient.sendTransaction({
        to: UNISWAP_ROUTER_ADDRESS as `0x${string}`,
        data: calldata as `0x${string}`,
        value: BigInt(value),
      })
      console.log("Swap transaction sent:", txHash)
      setSwapTxHash(txHash)
    } catch (err: unknown) {
      console.error("Swap failed:", err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred.")
      }
      setIsSwapping(false)
      setIsApproving(false)
    }
  }, [quote, walletClient, account, balances, fromToken, fromAmount, writeContractAsync, activeChain, publicClient])

  useEffect(() => {
    if (isApprovalConfirmed) {
      console.log("Approval confirmed!")
      handleSwap(true) // Continue with the swap after approval
    }
  }, [isApprovalConfirmed, handleSwap])

  const swapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
  }

  const getButtonText = () => {
    if (isApproving) return "Approving..."
    if (isConfirmingApproval) return "Waiting for Approval..."
    if (isSwapping) return "Swapping..."
    if (isConfirmingSwap) return "Confirming Swap..."
    if (quote && fromToken !== 'ETH') return "Approve & Swap"
    return "Confirm Swap"
  }
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-40"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 max-w-md mx-auto"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Swap Tokens</h2>
            <button onClick={onClose} className="p-2 hover:bg-secondary/30 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* From Token */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">From</label>
              <div className="flex gap-2">
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="w-24 px-3 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none"
                >
                  <option>ETH</option>
                  <option>USDC</option>
                  <option>DAI</option>
                </select>
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 px-4 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={swapTokens}
                className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <ArrowRightLeft size={20} className="text-primary" />
              </motion.button>
            </div>

            {/* To Token */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">To</label>
              <div className="flex gap-2">
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  className="w-24 px-3 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none"
                >
                  <option>USDC</option>
                  <option>ETH</option>
                  <option>DAI</option>
                </select>
                <input
                  type="number"
                  value={toAmount}
                  readOnly
                  placeholder="0.00"
                  className="flex-1 px-4 py-3 rounded-lg bg-background border border-border outline-none text-muted-foreground"
                />
              </div>
            </div>

            {/* Exchange Rate */}
            <div className="bg-secondary/20 rounded-lg p-3 border border-secondary/30">
              {isQuoteLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-xs text-muted-foreground ml-2">Fetching best price...</span>
                </div>
              ) : quote ? (
                <p className="text-xs text-muted-foreground">
                  1 {fromToken} ≈ {quote.trade.executionPrice.toSignificant(6)} {toToken}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Enter an amount to see the quote</p>
              )}
            </div>

            {quoteError && <p className="text-red-500 text-sm text-center">{quoteError}</p>}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Button
              onClick={() => handleSwap()}
              disabled={!fromAmount || !quote || isApproving || isSwapping || isConfirmingApproval || isConfirmingSwap}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold py-3 rounded-lg transition-all"
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
