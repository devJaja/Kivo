"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, AlertCircle } from "lucide-react"

export default function SendPage() {
  const [to, setTo] = useState("")
  const [asset, setAsset] = useState("eth")
  const [amount, setAmount] = useState("")

  const handleSend = () => {
    if (to && amount) {
      alert(`Sending ${amount} ${asset.toUpperCase()} to ${to}\n\nGas fee: FREE (Kivo covers it!)`)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Send Tokens</h1>
      <p className="text-muted-foreground mb-8">Transfer your assets with zero gas fees</p>

      <Card className="p-8">
        <div className="space-y-6">
          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium mb-2">Recipient Address</label>
            <Input
              placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f..."
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          {/* Asset Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Asset</label>
            <Select value={asset} onValueChange={setAsset}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eth">ETH - Ethereum</SelectItem>
                <SelectItem value="usdc">USDC - Stablecoin</SelectItem>
                <SelectItem value="base">BASE - Base Token</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">Amount</label>
            <Input type="number" placeholder="0.5" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <p className="text-sm text-muted-foreground mt-2">Available: 2.5 ETH</p>
          </div>

          {/* Gas Notice */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Gasless Transaction</p>
              <p className="text-sm text-muted-foreground">Kivo covers all gas fees for you</p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold">
                {amount || "0"} {asset.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-border">
              <span className="text-muted-foreground">Network Fee</span>
              <span className="text-green-400 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="font-semibold text-lg">
                {amount || "0"} {asset.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={!to || !amount} className="flex-1 gap-2">
              Send <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
