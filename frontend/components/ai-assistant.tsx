"use client"

import { motion } from "framer-motion"
import { MessageCircle, Zap, CheckCircle, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { useAIAgent, AgentSuggestion } from "@/hooks/use-ai-agent"
import Button from "./ui/button"

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const { suggestions, executeAction } = useAIAgent()
  const [executingId, setExecutingId] = useState<string | null>(null)

  const handleExecute = async (suggestion: AgentSuggestion) => {
    if (!suggestion) return
    setExecutingId(suggestion.id)
    try {
      await executeAction(suggestion)
    } catch (error) {
      console.error("Execution failed", error)
    } finally {
      setExecutingId(null)
    }
  }

  const getRiskColor = (riskLevel?: "low" | "medium" | "high") => {
    switch (riskLevel) {
      case "low":
        return "text-green-500"
      case "medium":
        return "text-yellow-500"
      case "high":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-30">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-4 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
      >
        <Zap size={24} />
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-full right-0 mb-3 w-80 bg-card border border-border rounded-lg shadow-lg"
        >
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">AI Agent</h3>
            <p className="text-sm text-muted-foreground">Arbitrage Opportunities</p>
          </div>
          <div className="p-2 max-h-80 overflow-y-auto">
            {suggestions.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Scanning for opportunities...
              </div>
            )}
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-3 mb-2 rounded-lg bg-background border border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">{suggestion.title}</p>
                    <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                  </div>
                  <div className={`flex items-center text-xs ${getRiskColor(suggestion.riskLevel)}`}>
                    <AlertTriangle size={12} className="mr-1" />
                    {suggestion.riskLevel}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs font-bold text-green-500">{suggestion.estimatedSavings}</p>
                  <Button
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
                    onClick={() => handleExecute(suggestion)}
                    disabled={executingId === suggestion.id}
                  >
                    {executingId === suggestion.id ? "Executing..." : "Execute"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
