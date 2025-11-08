"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Wallet, Send, Repeat2, Lock, Sparkles, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: Wallet },
  { href: "/app/send", label: "Send", icon: Send },
  { href: "/app/receive", label: "Receive", icon: Send },
  { href: "/app/swap", label: "Swap", icon: Repeat2 },
  { href: "/app/security", label: "Security", icon: Lock },
  { href: "/app/ai", label: "AI Feed", icon: Sparkles },
]

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // useEffect(() => {
  //   const session = useSession()
  //   if (!session.data) {
  //     redirect("/onboarding")
  //   }
  // }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-card rounded-lg border border-border">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-card border-r border-border z-30 transform lg:transform-none transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">K</span>
            </div>
            <span className="font-bold text-lg">Kivo</span>
          </Link>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </Link>
              )
            })}
          </nav>

          <div className="mt-8 pt-6 border-t border-border">
            <Button variant="outline" className="w-full gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              Disconnect
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-0 pt-16 lg:pt-0">{children}</main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-20" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
