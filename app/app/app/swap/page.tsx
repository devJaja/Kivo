"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownUp, AlertCircle } from "lucide-react"

export default function SwapPage() {
  const [from, setFrom] = useState("eth")
  const [to, setTo] = useState("usdc")
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")

  const handleSwap = () => {
    if (fromAmount) {
      alert(`Swapping ${fromAmount} ${from.toUpperCase()} for ${toAmount} ${to.toUpperCase()}\n\nGas fee: FREE!`)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Swap Tokens</h1>
      <p className="text-muted-foreground mb-8">Exchange tokens with optimal routing</p>

      <Card className="p-8">
        <div className="space-y-6">
          {/* From */}
          <div>
            <label className="block text-sm font-medium mb-2">From</label>
            <div className="space-y-3">
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eth">ETH - Ethereum</SelectItem>
                  <SelectItem value="usdc">USDC - Stablecoin</SelectItem>
                  <SelectItem value="base">BASE - Base Token</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="0.5"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Available: 2.5 {from.toUpperCase()}</p>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button className="p-3 bg-primary/20 hover:bg-primary/30 rounded-full transition border border-primary/30">
              <ArrowDownUp className="w-5 h-5 text-primary" />
            </button>
          </div>

          {/* To */}
          <div>
            <label className="block text-sm font-medium mb-2">To</label>
            <div className="space-y-3">
              <Select value={to} onValueChange={setTo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eth">ETH - Ethereum</SelectItem>
                  <SelectItem value="usdc">USDC - Stablecoin</SelectItem>
                  <SelectItem value="base">BASE - Base Token</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="1,000"
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                disabled
              />
            </div>
          </div>

          {/* Price Info */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Price Impact</span>
              <span className="font-semibold">0.1%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Network Fee</span>
              <span className="font-semibold text-green-400">FREE</span>
            </div>
          </div>

          {/* Gas Notice */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Smart Routing</p>
              <p className="text-sm text-muted-foreground">Finding the best price across all DEXs</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSwap} disabled={!fromAmount} className="flex-1">
              Swap Now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
