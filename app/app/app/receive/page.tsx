"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

export default function ReceivePage() {
  const [copied, setCopied] = useState(false)
  const address = "0x742d35Cc6634C0532925a3b844Bc9e7595f1234"

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Receive Tokens</h1>
      <p className="text-muted-foreground mb-8">Share your address to receive funds</p>

      <Card className="p-8 text-center">
        <div className="mb-8">
          <div className="w-48 h-48 mx-auto bg-card border-2 border-primary rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">QR Code Placeholder</p>
              <p className="text-xs text-muted-foreground">In a real app, QR code would display here</p>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-4">Your Address</h3>

        <div className="bg-card border border-border rounded-lg p-4 mb-6 font-mono text-sm break-all">{address}</div>

        <Button onClick={handleCopy} className="w-full gap-2">
          {copied ? (
            <>
              <Check className="w-4 h-4" /> Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" /> Copy Address
            </>
          )}
        </Button>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <p className="text-sm">
              <span className="font-semibold">💡 Tip:</span> You can receive on any blockchain. Kivo automatically
              bridges assets across chains.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
