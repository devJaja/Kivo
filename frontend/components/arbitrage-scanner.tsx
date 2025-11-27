"use client";

import { useState } from "react";
import { useDEXArbitrageAgent, DEXArbitrageSuggestion } from "@/hooks/useDEXArbitrageAgent";
import { useGeminiAI } from "@/hooks/useGeminiAI";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Loader, Zap, AlertTriangle, Info, CheckCircle, Square } from "lucide-react";

export default function ArbitrageScanner() {
  const {
    suggestions,
    isScanning,
    scanProgress,
    activityLogs,
    startScanning,
    stopScanning,
    executingId,
    executeSuggestion,
  } = useDEXArbitrageAgent();

  const { generateContent, isLoading: isAiLoading, error: aiError } = useGeminiAI();
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const handleScan = () => {
    setAiAnalysis(null);
    startScanning();
  };

  const handleStopScan = () => {
    stopScanning();
  }

  const handleAnalyze = async (opportunity: DEXArbitrageSuggestion) => {
    const prompt = `
      Analyze the following DEX arbitrage opportunity and provide a summary for a user.
      Explain the route, the potential profit, and the risks involved.
      Keep it concise and easy to understand.

      Opportunity Details:
      - Chain: ${opportunity.chain}
      - Route: ${opportunity.route.join(" -> ")}
      - DEXs: ${opportunity.dexRoute.join(" -> ")}
      - Amount In: ${opportunity.amountIn} ${opportunity.route[0]}
      - Expected Out: ${opportunity.expectedOut} ${opportunity.route[opportunity.route.length - 1]}
      - Profit: ${opportunity.profitPercent.toFixed(4)}%
      - Estimated Net Profit: $${opportunity.netProfit} (after gas)
      - Risk Level: ${opportunity.riskLevel}
    `;

    const analysis = await generateContent(prompt);
    setAiAnalysis(analysis);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">Arbitrage Scanner</h2>
        {!isScanning ? (
          <Button onClick={handleScan} disabled={isScanning}>
            <Zap className="mr-2 h-4 w-4" />
            Scan for Opportunities
          </Button>
        ) : (
          <Button onClick={handleStopScan} disabled={!isScanning} variant="destructive">
            <Square className="mr-2 h-4 w-4" />
            Stop Scanner
          </Button>
        )}
      </div>

      {isScanning && scanProgress && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Scanning on {scanProgress.currentChain}: {scanProgress.currentRoute}
          </p>
          <div className="w-full bg-muted rounded-full h-2.5">
            <motion.div
              className="bg-primary h-2.5 rounded-full"
              initial={{ width: "0%" }}
              animate={{
                width: `${(scanProgress.completedRoutes / scanProgress.totalRoutes) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-right text-muted-foreground">
            {scanProgress.completedRoutes} / {scanProgress.totalRoutes} routes checked
          </p>
        </div>
      )}

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h3 className="font-semibold">
              {suggestions.length} Opportunities Found:
            </h3>
            {suggestions.map((opp: DEXArbitrageSuggestion) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onAnalyze={handleAnalyze}
                onExecute={() => executeSuggestion(opp)}
                isExecuting={executingId === opp.id}
                isAiLoading={isAiLoading}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {aiAnalysis && (
        <div className="border-t border-border pt-4 mt-4">
           <h3 className="font-semibold mb-2">AI Analysis:</h3>
           <div className="text-sm p-3 bg-muted rounded-md whitespace-pre-wrap">
             {aiAnalysis}
           </div>
        </div>
      )}

    </div>
  );
}

function OpportunityCard({
  opportunity,
  onAnalyze,
  onExecute,
  isExecuting,
  isAiLoading,
}: {
  opportunity: DEXArbitrageSuggestion;
  onAnalyze: (opp: DEXArbitrageSuggestion) => void;
  onExecute: () => void;
  isExecuting: boolean;
  isAiLoading: boolean;
}) {
  const {
    title,
    description,
    chain,
    profitPercent,
    estimatedProfit,
    riskLevel,
  } = opportunity;

  const riskColor =
    riskLevel === "low"
      ? "text-green-400"
      : riskLevel === "medium"
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-muted/50 border border-border/70 rounded-lg p-3 space-y-2"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${riskColor}`}>
          <AlertTriangle size={14} />
          {riskLevel.toUpperCase()}
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div className="text-sm space-y-1">
            <p><span className="font-semibold">Profit:</span> <span className="text-green-400 font-bold">{profitPercent}%</span></p>
            <p><span className="font-semibold">Est. Net:</span> <span className="font-mono">${estimatedProfit}</span></p>
            <p><span className="font-semibold">Chain:</span> <span className="capitalize">{chain}</span></p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onAnalyze(opportunity)} disabled={isAiLoading}>
                {isAiLoading ? <Loader className="h-4 w-4 animate-spin"/> : "Analyze"}
            </Button>
            <Button size="sm" onClick={onExecute} disabled={isExecuting}>
                {isExecuting ? <Loader className="h-4 w-4 animate-spin"/> : "Execute"}
            </Button>
        </div>
      </div>
    </motion.div>
  );
}
