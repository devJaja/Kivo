"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePrivy } from "@privy-io/react-auth"
import { parseEther, parseUnits, encodeFunctionData, formatEther } from "viem"
import { useWalletStore } from "@/store/wallet-store"
import { usePublicClient, useWalletClient, useWriteContract, useWaitForTransactionReceipt, useEstimateGas } from "wagmi"
import { RealTimePriceOracle } from "@/lib/priceOracle"
import { erc20Abi } from "viem" // Standard ERC-20 ABI

interface SendModalProps {
  onClose: () => void
}

export default function SendModal({ onClose }: SendModalProps) {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [token, setToken] = useState("ETH")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, sendTransaction } = usePrivy()
  const { balances, activeChain } = useWalletStore()
  const priceOracle = new RealTimePriceOracle()

  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const [currentTxHash, setCurrentTxHash] = useState<`0x${string}` | undefined>(undefined)

  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isTxError } = useWaitForTransactionReceipt({
    hash: currentTxHash,
  })

  // Get active chain ID from wallet store
  const activeChainId = parseInt(activeChain, 10)

  // Prepare gas estimation config
  const tokenAddress = token !== "ETH" ? priceOracle.getTokenAddress(activeChainId.toString(), token) : undefined
  const decimals = 6 // Assuming 6 for USDC/USDT, fetch dynamically in a real app
  const amountWei = amount && token !== "ETH" ? parseUnits(amount, decimals) : undefined

  const gasEstimateConfig =
    token === "ETH"
      ? {
          to: recipient as `0x${string}`,
          value: amount ? parseEther(amount) : undefined,
        }
      : {
          to: tokenAddress as `0x${string}`,
          data:
            tokenAddress && amountWei && recipient
              ? encodeFunctionData({
                  abi: erc20Abi,
                  functionName: "transfer",
                  args: [recipient as `0x${string}`, amountWei],
                })
              : undefined,
        }

  const { data: gasEstimate, isLoading: isGasLoading, error: gasError } = useEstimateGas({
    ...gasEstimateConfig,
    query: {
      enabled: !!recipient && !!amount && !isNaN(Number(amount)) && Number(amount) > 0 && !!gasEstimateConfig.to,
    },
  })

  useEffect(() => {
    if (isConfirmed) {
      console.log("Transaction confirmed!")
      onClose()
    }
    if (isTxError) {
      setError("Transaction failed to confirm on chain.")
      console.error("Transaction failed to confirm.")
    }
  }, [isConfirmed, isTxError, onClose])

  const handleConfirm = async () => {
    setError(null)
    if (!recipient) {
      setError("Recipient address cannot be empty.")
      return
    }
    if (Number(amount) <= 0) {
      setError("Amount must be greater than zero.")
      return
    }
    if (!user || !user.wallet) {
      setError("Wallet not connected.")
      return
    }

    const chainBalances = balances[activeChain]
    const tokenBalance = chainBalances ? parseFloat(chainBalances[token]) : 0

    if (parseFloat(amount) > tokenBalance) {
      setError(`Insufficient ${token} balance.`)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      let txHash: `0x${string}` | undefined

      if (token === "ETH") {
        const tx = await sendTransaction({
          to: recipient as `0x${string}`,
          value: parseEther(amount),
        })
        txHash = tx.hash
        setCurrentTxHash(txHash) // Set the transaction hash to monitor
      } else {
        // ERC-20 Token Transfer (USDC, USDT)
        const tokenAddress = priceOracle.getTokenAddress(activeChainId.toString(), token)
        if (!tokenAddress) {
          throw new Error(`Token address not found for ${token} on chain ${activeChainId}`)
        }

        // For now, hardcode decimals for USDC/USDT. In a real app, fetch this from the contract.
        const decimals = 6 // USDC and USDT typically have 6 decimals

        const amountWei = parseUnits(amount, decimals)

        const hash = await writeContractAsync({
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "transfer",
          args: [recipient as `0x${string}`, amountWei],
        })
        txHash = hash
        setCurrentTxHash(txHash) // Set the transaction hash to monitor
      }

      if (txHash) {
        console.log("Transaction sent, hash:", txHash)
        // The modal will close once the transaction is confirmed or errors out via the useEffect below
      }
    } catch (err: unknown) {
      console.error("Transaction failed:", err)
      if (err instanceof Error) {
        setError(err.message || "Transaction failed. Please try again.")
      } else {
        setError("An unknown error occurred.")
      }
      setIsLoading(false) // Stop loading on immediate error
    }
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
            <h2 className="text-xl font-bold text-foreground">Send Token</h2>
            <button onClick={onClose} className="p-2 hover:bg-secondary/30 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Recipient Address</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f42bE"
                className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Token</label>
                <select
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors"
                >
                  <option>ETH</option>
                  <option>USDC</option>
                  <option>USDT</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  Your balance: {balances[activeChain]?.[token] || "0"} {token}
                </p>
              </div>
            </div>

            <div className="bg-secondary/20 rounded-lg p-4 border border-secondary/30">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gas Fees</span>
                {isGasLoading ? (
                  <span className="text-sm font-semibold text-foreground">Estimating...</span>
                ) : gasError ? (
                  <span className="text-sm text-red-500">Error estimating gas</span>
                ) : gasEstimate ? (
                  <span className="text-sm font-semibold text-foreground">
                    ~{formatEther(gasEstimate)} ETH
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-foreground">Sponsored by Kivo</span>
                )}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Button
              onClick={handleConfirm}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all"
              disabled={isLoading || isConfirming}
            >
              {isLoading ? "Sending..." : isConfirming ? "Confirming..." : "Confirm Send"}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
