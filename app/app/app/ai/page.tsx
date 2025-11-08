"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, Zap, ArrowRight } from "lucide-react"

export default function AIFeedPage() {
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">AI Feed</h1>
      <p className="text-muted-foreground mb-8">Smart recommendations powered by AI (Phase 2)</p>

      {/* Coming Soon Banner */}
      <Card className="p-8 text-center bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30 mb-8">
        <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">AI Features Coming Soon</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          We're training advanced AI models to find the best opportunities for your portfolio, optimize your routes, and
          maximize your returns.
        </p>
        <Button className="gap-2">
          Join Waitlist <ArrowRight className="w-4 h-4" />
        </Button>
      </Card>

      {/* Preview Cards */}
      <div className="space-y-6">
        <Card className="p-6 opacity-60 pointer-events-none">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Arbitrage Opportunity</h3>
              <p className="text-sm text-muted-foreground">
                ETH is trading at $2,250 on Uniswap and $2,340 on Curve. Execute trade?
              </p>
            </div>
          </div>
          <Button size="sm" className="gap-2">
            View Opportunity <ArrowRight className="w-3 h-3" />
          </Button>
        </Card>

        <Card className="p-6 opacity-60 pointer-events-none">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Gas Price Alert</h3>
              <p className="text-sm text-muted-foreground">
                Gas prices dropped 40%. Great time to execute your pending transaction.
              </p>
            </div>
          </div>
          <Button size="sm" className="gap-2">
            Execute <ArrowRight className="w-3 h-3" />
          </Button>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="p-6 mt-8 bg-card border-primary/30">
        <h3 className="font-semibold mb-3">What's Coming in Phase 2</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full" />
            Monitor opportunities across multiple chains
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full" />
            Find profitable arbitrage routes
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full" />
            Execute or recommend optimal strategies
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full" />
            Smart risk management
          </li>
        </ul>
      </Card>
    </div>
  )
}
