"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWalletStore, type WalletSettings } from "@/store/wallet-store"
import WaterButton from "@/components/water-button"

export default function SettingsPage() {
  const router = useRouter()
  const { settings, updateSettings } = useWalletStore()

  const [localSettings, setLocalSettings] = useState(settings)
  const [hasChanges, setHasChanges] = useState(false)

  const handleSettingChange = (key: keyof typeof settings, value: WalletSettings[typeof key]) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    updateSettings(localSettings)
    setHasChanges(false)
  }

  const handleExportLogs = () => {
    const logsData = {
      settings: localSettings,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    }
    const dataStr = JSON.stringify(logsData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `kivo-logs-${Date.now()}.json`
    link.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-screen flex flex-col bg-background overflow-y-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-4 py-6 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10"
      >
        <div className="flex items-center justify-between max-w-md mx-auto w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </motion.button>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          {hasChanges && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-primary text-primary-foreground rounded-lg"
            >
              <Save size={16} />
              <span>Save</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-6">
        {/* Account Settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-bold text-foreground">Account</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Display Name</label>
            <input
              type="text"
              value={localSettings.displayName}
              onChange={(e) => handleSettingChange("displayName", e.target.value)}
              className="w-full px-4 py-2 bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </motion.section>

        {/* Wallet Settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-bold text-foreground">Wallet</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              Auto-Sponsor Transactions
              <span className="text-xs text-muted-foreground">(Gasless when available)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={localSettings.autoSponsor}
                onChange={(e) => handleSettingChange("autoSponsor", e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-muted-foreground">
                {localSettings.autoSponsor ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Slippage Tolerance</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={localSettings.slippageTolerance}
                onChange={(e) => handleSettingChange("slippageTolerance", Number.parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium w-12 text-right text-foreground">
                {localSettings.slippageTolerance.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Gas Strategy</label>
            <select
              value={localSettings.defaultGasStrategy}
              onChange={(e) => handleSettingChange("defaultGasStrategy", e.target.value)}
              className="w-full px-3 py-2 bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="slow">Slow (Lower cost)</option>
              <option value="standard">Standard</option>
              <option value="fast">Fast (Higher cost)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Relayer Selection</label>
            <select
              value={localSettings.selectedRelayer}
              onChange={(e) => handleSettingChange("selectedRelayer", e.target.value)}
              className="w-full px-3 py-2 bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="mock">Mock (Development)</option>
              <option value="pimlico">Pimlico</option>
              <option value="stackup">Stackup</option>
            </select>
          </div>
        </motion.section>

        {/* Privacy Settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-bold text-foreground">Privacy</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">Analytics & Telemetry</label>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={localSettings.analyticsOptIn}
                onChange={(e) => handleSettingChange("analyticsOptIn", e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-muted-foreground">
                {localSettings.analyticsOptIn ? "Help us improve by sharing usage data" : "Analytics disabled"}
              </span>
            </div>
          </div>
        </motion.section>

        {/* Developer Settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-bold text-foreground">Developer</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">Developer Mode</label>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={localSettings.developerMode}
                onChange={(e) => handleSettingChange("developerMode", e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-muted-foreground">
                {localSettings.developerMode ? "Enabled - Showing AA logs" : "Disabled"}
              </span>
            </div>
          </div>

          <WaterButton variant="secondary" size="sm" className="w-full" onClick={handleExportLogs}>
            <Download size={16} />
            <span>Export Logs</span>
          </WaterButton>
        </motion.section>

        {/* Support */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="space-y-4 pb-6"
        >
          <h2 className="text-lg font-bold text-foreground">Support</h2>

          <WaterButton
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => {
              window.location.href = "mailto:support@kivo.app"
            }}
          >
            Contact Support
          </WaterButton>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Version 0.1.0 • Built with Account Abstraction • Secured by Privy
            </p>
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}
