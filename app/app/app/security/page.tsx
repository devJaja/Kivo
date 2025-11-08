"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Eye, Lock, Users, AlertTriangle } from "lucide-react"

export default function SecurityPage() {
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Security & Recovery</h1>
      <p className="text-muted-foreground mb-8">Manage your wallet recovery and security settings</p>

      {/* Security Status */}
      <Card className="p-6 mb-8 bg-green-500/10 border-green-500/30">
        <div className="flex items-start gap-4">
          <Shield className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-1">Your wallet is secured</h3>
            <p className="text-sm text-muted-foreground">All security features are configured</p>
          </div>
        </div>
      </Card>

      {/* Recovery Methods */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Email Recovery</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Recover your wallet using email authentication</p>
          <Button variant="outline" className="w-full bg-transparent">
            Manage
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Biometric Lock</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Add fingerprint or face recognition</p>
          <Button variant="outline" className="w-full bg-transparent">
            Enable
          </Button>
        </Card>
      </div>

      {/* Guardians */}
      <Card className="p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Recovery Guardians</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Designate trusted contacts to help recover your wallet</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
            <div>
              <p className="font-semibold">alice@example.com</p>
              <p className="text-sm text-muted-foreground">Added 30 days ago</p>
            </div>
            <Button variant="outline" size="sm">
              Remove
            </Button>
          </div>
        </div>
        <Button className="w-full mt-4">Add Guardian</Button>
      </Card>

      {/* Spending Limits */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-6">Transaction Limits</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Daily Limit</label>
              <span className="text-sm text-muted-foreground">$10,000</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: "45%" }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">$4,500 used today</p>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-6 bg-transparent">
          Adjust Limits
        </Button>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 mt-8 border-destructive/50">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <h3 className="font-semibold">Danger Zone</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          These actions cannot be undone. Please proceed with caution.
        </p>
        <Button
          variant="outline"
          className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
        >
          Disconnect Wallet
        </Button>
      </Card>
    </div>
  )
}
