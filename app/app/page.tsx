"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Shield, Zap, Brain, Check, Lock, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

export default function Home() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      <header className="fixed top-0 w-full backdrop-blur-sm bg-background/80 border-b border-border/50 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/kivo-logo.png" alt="Kivo Logo" width={40} height={40} className="w-10 h-10" />
            <span className="text-xl font-bold">Kivo</span>
          </Link>
          <Link href="/app/dashboard">
            <Button className="bg-primary hover:bg-primary/90">Open App</Button>
          </Link>
        </div>
      </header>

      <section className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-1/3 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy and CTA */}
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1 w-fit">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Web3 Wallet</span>
            </div>

            <h1 className="text-6xl lg:text-7xl font-bold mb-6 text-balance leading-tight">
              Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                smarter
              </span>{" "}
              Web3 wallet
            </h1>

            <p className="text-xl text-muted-foreground mb-2 text-balance">
              No seed phrases. No gas fees. Just powerful, intelligent transactions.
            </p>
            <p className="text-lg text-muted-foreground/80 mb-8">
              Kivo abstracts away the complexity of crypto, giving you the power of Web3 with the simplicity you
              deserve.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/onboarding" className="flex-1 sm:flex-none">
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-lg h-12 px-8">
                  Create Wallet Free <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <button className="px-8 h-12 border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors font-medium">
                View Docs
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Account Abstraction</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Gasless Txns</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Bank-Grade Security</span>
              </div>
            </div>
          </div>

          {/* Right: Logo showcase with animation */}
          <div className="flex justify-center items-center">
            <div className="relative w-80 h-80 flex items-center justify-center">
              {/* Animated glow rings */}
              <div className="absolute inset-0 border border-primary/30 rounded-2xl animate-pulse"></div>
              <div
                className="absolute inset-4 border border-primary/20 rounded-2xl animate-pulse"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="absolute inset-8 border border-primary/10 rounded-2xl animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>

              {/* Logo with shadow */}
              <div
                className="relative z-10 filter drop-shadow-2xl"
                style={{
                  transform: `translateY(${scrollY * 0.3}px)`,
                  transition: "transform 0.1s ease-out",
                }}
              >
                <Image src="/kivo-logo.png" alt="Kivo Smart Wallet" width={280} height={280} className="w-72 h-72" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Built for the future of crypto</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience Web3 the way it should be. Powerful. Secure. Effortless.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="p-8 border border-primary/20 hover:border-primary/40 transition-colors bg-card/50 backdrop-blur">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">No Seed Phrases</h3>
              <p className="text-muted-foreground mb-6">
                Forget complex 12-word mnemonics. Your wallet is secured with modern authentication methods you actually
                want to use.
              </p>
              <div className="flex items-center gap-2 text-primary text-sm font-medium">
                <Check className="w-4 h-4" /> Simpler onboarding
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="p-8 border border-primary/20 hover:border-primary/40 transition-colors bg-card/50 backdrop-blur">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Zero Gas Fees</h3>
              <p className="text-muted-foreground mb-6">
                We cover the gas costs. Every transaction is optimized and abstracted away so you only pay for what
                matters.
              </p>
              <div className="flex items-center gap-2 text-primary text-sm font-medium">
                <Check className="w-4 h-4" /> Save on every transaction
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="p-8 border border-primary/20 hover:border-primary/40 transition-colors bg-card/50 backdrop-blur">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI Intelligence</h3>
              <p className="text-muted-foreground mb-6">
                Smart recommendations for yields, swaps, and opportunities. Your wallet learns what matters to you.
              </p>
              <div className="flex items-center gap-2 text-primary text-sm font-medium">
                <Check className="w-4 h-4" /> Coming in Phase 2
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="relative py-24 bg-card/30 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">Why builders choose Kivo</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {[
                { icon: Shield, title: "Self-Custodial", desc: "Your funds, your control. No intermediaries." },
                { icon: Zap, title: "Instant Transactions", desc: "Near-instant settlement across all chains." },
                { icon: Lock, title: "Cryptographically Secure", desc: "Military-grade encryption for your keys." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              {[
                { icon: Sparkles, title: "Multi-Chain Ready", desc: "Seamlessly swap and send across networks." },
                { icon: Brain, title: "Smart Routing", desc: "Automatically finds the best paths for your transfers." },
                { icon: Check, title: "Developer Friendly", desc: "Open APIs and SDKs for custom integrations." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24 border-t border-border/50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to experience Web3 differently?</h2>
          <p className="text-xl text-muted-foreground mb-12 text-balance">
            Join thousands of users who've simplified their crypto journey. Create your smart wallet in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding" className="flex-1 sm:flex-none">
              <Button size="lg" className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-lg h-12 px-12">
                Get Started <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <button className="px-12 h-12 border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors font-medium">
              Schedule Demo
            </button>
          </div>

          <p className="text-sm text-muted-foreground mt-8">No credit card required. Free forever tier available.</p>
        </div>
      </section>

      <footer className="border-t border-border/50 py-12 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2025 Kivo. The smarter way to do Web3.</p>
        </div>
      </footer>
    </main>
  )
}
