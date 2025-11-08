"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send, ArrowDownLeft, ArrowUpRight, TrendingUp, Settings } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [displayName, setDisplayName] = useState("User")

  useEffect(() => {
    const savedName = localStorage.getItem("displayName")
    if (savedName) {
      setDisplayName(savedName)
    }
  }, [])

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {displayName}! 👋</h1>
          <p className="text-muted-foreground">Here's your wallet overview.</p>
        </div>
        <Link href="/app/security">
          <Button size="icon" variant="outline" className="bg-transparent">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Balance Card */}
      <Card className="p-8 mb-6 bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30 glow-primary">
        <p className="text-muted-foreground text-sm mb-2">Total Balance</p>
        <h2 className="text-5xl font-bold mb-2">$4,018.4K</h2>
        <p className="text-green-400 text-sm flex items-center gap-1">
          <TrendingUp className="w-4 h-4" /> +23.5% this month
        </p>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Link href="/app/send">
          <Button className="w-full h-full flex-col gap-2 py-6">
            <Send className="w-5 h-5" />
            <span>Send</span>
          </Button>
        </Link>
        <Link href="/app/receive">
          <Button variant="outline" className="w-full h-full flex-col gap-2 py-6 bg-transparent">
            <ArrowDownLeft className="w-5 h-5" />
            <span>Receive</span>
          </Button>
        </Link>
        <Link href="/app/swap">
          <Button variant="outline" className="w-full h-full flex-col gap-2 py-6 bg-transparent">
            <Send className="w-5 h-5" />
            <span>Swap</span>
          </Button>
        </Link>
        <Link href="/app/security">
          <Button variant="outline" className="w-full h-full flex-col gap-2 py-6 bg-transparent">
            <Send className="w-5 h-5" />
            <span>Security</span>
          </Button>
        </Link>
      </div>

      {/* Assets */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Your Assets</h3>
        <Card className="divide-y divide-border">
          {[
            { symbol: "ETH", name: "Ethereum", amount: "2.5", value: "$4,250", change: "+12.5%" },
            { symbol: "USDC", name: "USDC Stablecoin", amount: "1,500", value: "$1,500", change: "+0.1%" },
            { symbol: "BASE", name: "Base Token", amount: "500", value: "$2,250.4K", change: "+45.2%" },
          ].map((asset) => (
            <div key={asset.symbol} className="p-4 flex items-center justify-between hover:bg-muted/50 transition">
              <div>
                <p className="font-semibold">{asset.name}</p>
                <p className="text-sm text-muted-foreground">
                  {asset.amount} {asset.symbol}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{asset.value}</p>
                <p className="text-sm text-green-400">{asset.change}</p>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <Card className="divide-y divide-border">
          {[
            { type: "Sent", asset: "ETH", amount: "-0.5", date: "2 hours ago", status: "Completed" },
            { type: "Received", asset: "USDC", amount: "+1,000", date: "1 day ago", status: "Completed" },
            { type: "Swapped", asset: "ETH → BASE", amount: "+250", date: "3 days ago", status: "Completed" },
          ].map((tx, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between hover:bg-muted/50 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{tx.type}</p>
                  <p className="text-sm text-muted-foreground">{tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {tx.amount} {tx.asset}
                </p>
                <p className="text-sm text-green-400">{tx.status}</p>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
