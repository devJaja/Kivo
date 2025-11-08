"use client"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mail, ArrowRight, Loader2 } from "lucide-react"

export default function OnboardingPage() {
  const [step, setStep] = useState<"login" | "verification" | "name">("login")
  const [email, setEmail] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)

  // const handleGmailLogin = async () => {
  //   setLoading(true)
  //   await signIn("google", { redirect: false })
  //   setLoading(false)
  // }

  const handleVerification = (code: string) => {
    if (code.length === 6) {
      setStep("name")
    }
  }

  const handleSaveDisplayName = async () => {
    if (displayName.trim()) {
      setLoading(true)
      // Store display name in localStorage and redirect to dashboard
      localStorage.setItem("displayName", displayName)
      localStorage.setItem("userEmail", email)
      setTimeout(() => {
        window.location.href = "/app/dashboard"
      }, 500)
    }
  }

  const handleSkip = () => {
    localStorage.setItem("displayName", "Kivo User")
    localStorage.setItem("userEmail", "user@kivo.com")
    window.location.href = "/app/dashboard"
  }

  const handleSocialLogin = (provider: string) => {
    if (provider === "Gmail") {
      handleSkip() // Skip to dashboard instead
      return
    }
    console.log(`[DISABLED] Logging in with ${provider}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card Container */}
        <Card className="bg-slate-900/80 border-purple-500/20 backdrop-blur-xl">
          <div className="p-8">
            {/* Header with Logo */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <Image src="/kivo-logo.png" alt="Kivo Logo" width={80} height={80} className="drop-shadow-lg" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent mb-2">
                Welcome to Kivo
              </h1>
              <p className="text-slate-300 text-sm">The intelligent Web3 wallet for everyone</p>
            </div>

            {/* Step 1: Login Options */}
            {step === "login" && (
              <>
                <div className="space-y-3 mb-6">
                  {/* Gmail */}
                  <button
                    onClick={() => handleSocialLogin("Gmail")}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-purple-500/30 bg-slate-800/50 hover:bg-slate-800/80 hover:border-purple-500/50 transition-all duration-300 group disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    )}
                    <span className="text-slate-200 font-medium">Continue with Gmail</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  {/* X (Twitter) */}
                  <button
                    onClick={() => handleSocialLogin("X")}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-purple-500/30 bg-slate-800/50 hover:bg-slate-800/80 hover:border-purple-500/50 transition-all duration-300 group"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.514l-5.106-6.694-5.835 6.694H2.423l7.734-8.853-8.143-10.747h6.67l4.872 6.452 5.286-6.452zM16.17 18.868l-2.859-4.129H7.04l2.954 4.129h6.176z" />
                    </svg>
                    <span className="text-slate-200 font-medium">Continue with X</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  {/* Farcaster */}
                  <button
                    onClick={() => handleSocialLogin("Farcaster")}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-purple-500/30 bg-slate-800/50 hover:bg-slate-800/80 hover:border-purple-500/50 transition-all duration-300 group"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 3h18v4H3zm0 6h18v8H3zm0 10h18v2H3z" />
                    </svg>
                    <span className="text-slate-200 font-medium">Continue with Farcaster</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  {/* Basename */}
                  <button
                    onClick={() => handleSocialLogin("Basename")}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-purple-500/30 bg-slate-800/50 hover:bg-slate-800/80 hover:border-purple-500/50 transition-all duration-300 group"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                    </svg>
                    <span className="text-slate-200 font-medium">Continue with Basename</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-slate-700"></div>
                  <span className="text-xs text-slate-400">or</span>
                  <div className="flex-1 h-px bg-slate-700"></div>
                </div>

                {/* Email Option */}
                <Link href="/onboarding/email">
                  <Button
                    variant="outline"
                    className="w-full border-slate-600 hover:border-slate-500 hover:bg-slate-800/50 bg-transparent"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Continue with Email
                  </Button>
                </Link>
              </>
            )}

            {/* Step 2: Email Verification */}
            {step === "verification" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Verify your email</h2>
                  <p className="text-slate-400 text-sm">We sent a verification code to your Gmail address</p>
                </div>

                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Enter your Gmail address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-purple-500 focus:outline-none text-white placeholder-slate-500 transition"
                  />

                  <div className="space-y-2">
                    <label className="text-sm text-slate-300">Verification Code</label>
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      onChange={(e) => {
                        const code = e.target.value
                        handleVerification(code)
                      }}
                      className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-purple-500 focus:outline-none text-white placeholder-slate-500 transition tracking-widest text-center font-mono"
                    />
                  </div>

                  <Button
                    onClick={() => setStep("login")}
                    variant="outline"
                    className="w-full border-slate-600 hover:border-slate-500 hover:bg-slate-800/50 bg-transparent"
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Display Name Setup */}
            {step === "name" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Choose your display name</h2>
                  <p className="text-slate-400 text-sm">This will appear on your dashboard and in transactions</p>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter your display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={30}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-purple-500 focus:outline-none text-white placeholder-slate-500 transition"
                  />
                  <p className="text-xs text-slate-400">{displayName.length}/30 characters</p>

                  <Button
                    onClick={handleSaveDisplayName}
                    disabled={!displayName.trim() || loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      "Continue to Dashboard"
                    )}
                  </Button>

                  <Button
                    onClick={() => setStep("verification")}
                    variant="outline"
                    className="w-full border-slate-600 hover:border-slate-500 hover:bg-slate-800/50 bg-transparent"
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}

            {/* Footer */}
            {step === "login" && (
              <>
                <p className="text-xs text-slate-400 text-center mt-8">
                  By signing up, you agree to our{" "}
                  <Link href="#" className="text-purple-400 hover:text-purple-300">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-purple-400 hover:text-purple-300">
                    Privacy Policy
                  </Link>
                </p>

                <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-slate-700">
                  <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-xs text-slate-400">Bank-level security with Account Abstraction</span>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Trust Statement */}
        {step === "login" && (
          <div className="text-center mt-6">
            <p className="text-xs text-slate-400">🔐 Secure & audited • No seed phrases • Gasless transactions</p>
          </div>
        )}
      </div>
    </main>
  )
}
