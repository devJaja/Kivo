"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  CheckCircle,
  AlertTriangle,
  Activity,
  ArrowRightLeft,
  Loader2,
  X,
  Settings,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import {
  useArbitrageAgent,
  AgentSuggestion,
  ActivityLog,
} from "@/hooks/use-arbitrage-agent";

export default function EnhancedAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"opportunities" | "analysis" | "logs">("opportunities");

  const [showSettings, setShowSettings] = useState(false);

  const {
    suggestions,
    isScanning,
    scanProgress,
    activityLogs,
    executingId,
    startScanning,
    stopScanning,
    executeSuggestion,
  } = useArbitrageAgent();

  const stats = useMemo(() => {
    const opportunitiesFound = suggestions.length;
    const totalProfit = suggestions.reduce((acc, s) => acc + parseFloat(s.netProfit), 0);
    const avgProfitPercent =
      opportunitiesFound > 0
        ? suggestions.reduce((acc, s) => acc + s.profitPercent, 0) / opportunitiesFound
        : 0;
    const bestOpportunity = suggestions.reduce(
      (best, current) =>
        parseFloat(current.netProfit) > parseFloat(best?.netProfit ?? "0") ? current : best,
      null as AgentSuggestion | null
    );

    return {
      totalScans: scanProgress?.totalScans ?? 0,
      opportunitiesFound,
      totalProfit: totalProfit.toFixed(2),
      avgProfitPercent: avgProfitPercent.toFixed(2),
      bestOpportunity,
    };
  }, [suggestions, scanProgress]);

  const getRiskColor = (riskLevel?: "low" | "medium" | "high") => {
    switch (riskLevel) {
      case "low":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "medium":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "high":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getLogIcon = (type: ActivityLog["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle size={12} className="text-green-500" />;
      case "error":
        return <AlertTriangle size={12} className="text-red-500" />;
      case "warning":
        return <AlertTriangle size={12} className="text-yellow-500" />;
      default:
        return <Activity size={12} className="text-blue-500" />;
    }
  };

  return (
    <>
      {/* Mobile: Bottom fixed button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        {/* Floating Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-3 sm:p-4 rounded-full bg-[#0093af] text-white shadow-lg hover:shadow-xl transition-shadow"
          style={{ backgroundColor: '#0093af' }}
        >
          <Zap size={20} className="sm:w-6 sm:h-6" />
          
          {/* Mode Badge */}
          <span className="absolute -top-1 -left-1 px-1.5 py-0.5 sm:px-2 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#007a8f]">
            AI
          </span>
          
          {/* Scanning Indicator */}
          {isScanning && (
            <span className="absolute top-0 right-0 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-500"></span>
            </span>
          )}
        </motion.button>

        {/* Main Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed inset-x-0 bottom-0 sm:absolute sm:bottom-full sm:right-0 sm:left-auto sm:inset-x-auto sm:mb-4 w-full sm:w-[450px] max-w-full sm:max-w-[450px] bg-white dark:bg-gray-900 border-t sm:border border-gray-200 dark:border-gray-800 sm:rounded-xl shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-3 sm:p-4 bg-[#0093af] text-white flex-shrink-0" style={{ backgroundColor: '#0093af' }}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                      <Zap size={18} className="sm:w-5 sm:h-5" />
                      <span className="hidden xs:inline">AI Arbitrage Agent</span>
                      <span className="xs:hidden">AI Agent</span>

                    </h3>
                    <p className="text-xs sm:text-sm text-white/80">
                      {isScanning ? "Scanning USDC, USDT & DAI..." : "Ready to scan"}
                    </p>
                  </div>
                  <div className="flex gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-1.5 sm:p-1 hover:bg-white/20 rounded-lg transition"
                    >
                      <Settings size={18} className="sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 sm:p-1 hover:bg-white/20 rounded-lg transition"
                    >
                      <X size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>







                {/* Controls */}
                <div className="mt-2 sm:mt-3 flex gap-2">
                  {!isScanning ? (
                    <button
                      onClick={startScanning}
                      className="flex-1 px-3 sm:px-4 py-2 bg-white text-[#0093af] rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                    >
                      <Activity size={14} className="sm:w-4 sm:h-4" />
                      Start Scanning
                    </button>
                  ) : (
                    <button
                      onClick={stopScanning}
                      className="flex-1 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2"
                    >
                      <X size={14} className="sm:w-4 sm:h-4" />
                      Stop
                    </button>
                  )}
                </div>
              </div>

              {/* Scan Progress */}
              {isScanning && scanProgress && (
                <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 bg-[#0093af]/10">
                  <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400 truncate mr-2">
                      {scanProgress.currentChain} • {scanProgress.currentToken}
                    </span>
                    <span className="font-semibold flex-shrink-0 text-[#0093af]">
                      {scanProgress.completedScans}/{scanProgress.totalScans}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                    <motion.div
                      className="h-1.5 sm:h-2 rounded-full bg-[#0093af]"
                      style={{ backgroundColor: '#0093af' }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(scanProgress.completedScans / scanProgress.totalScans) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1.5 sm:mt-2">
                    <span>{scanProgress.routesAnalyzed} routes</span>
                    <span>{stats.opportunitiesFound} found</span>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                {(["opportunities", "analysis", "logs"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium capitalize transition ${
                      activeTab === tab
                        ? 'border-b-2 border-[#0093af] text-[#0093af]'
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Content - Scrollable */}
              <div className="p-3 sm:p-4 overflow-y-auto flex-1">
                {/* Opportunities Tab */}
                {activeTab === "opportunities" && (
                  <div className="space-y-2 sm:space-y-3">
                    {suggestions.length === 0 ? (
                      <div className="text-center py-8 sm:py-12">
                        <Activity className="mx-auto text-gray-400 mb-2 sm:mb-3" size={40} />
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                          {isScanning ? "Scanning..." : "No opportunities"}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Scanning USDC, USDT & DAI
                        </p>
                      </div>
                    ) : (
                      suggestions.map((suggestion) => (
                        <motion.div
                          key={suggestion.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:border-[#0093af] dark:hover:border-[#0093af] transition"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 mr-2">
                              <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                                <ArrowRightLeft size={12} className="sm:w-3.5 sm:h-3.5" />
                                {suggestion.token}
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                                {suggestion.fromChainName} → {suggestion.toChainName}
                              </p>

                            </div>
                            <span
                              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border flex-shrink-0 ${getRiskColor(
                                suggestion.riskLevel
                              )}`}
                            >
                              {suggestion.riskLevel}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-[10px] sm:text-xs mb-2 sm:mb-3">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Profit:</span>
                              <p className="font-bold text-green-600 dark:text-green-400 truncate">
                                {suggestion.profitPercent}% (${suggestion.estimatedProfit})
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Gas:</span>
                              <p className="font-semibold text-gray-700 dark:text-gray-300">
                                ${suggestion.gasEstimate}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Bridge:</span>
                              <p className="font-semibold text-gray-700 dark:text-gray-300">
                                ${suggestion.bridgeFee}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Net:</span>
                              <p
                                className={`font-bold ${
                                  parseFloat(suggestion.netProfit) > 0
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                ${suggestion.netProfit}
                              </p>
                            </div>
                          </div>

                          <Button
                            className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white rounded-lg transition disabled:opacity-50 bg-[#0093af] hover:bg-[#007a8f]"
                            style={{ backgroundColor: executingId === suggestion.id ? '#6b7280' : '#0093af' }}
                            onClick={() => executeSuggestion(suggestion)}
                            disabled={executingId === suggestion.id}
                          >
                            {executingId === suggestion.id ? (
                              <>
                                <Loader2 size={14} className="animate-spin mr-1.5 inline" />
                                Executing...
                              </>
                            ) : (
                              <>
                                <Zap size={14} className="mr-1.5 inline" />
                                Execute
                              </>
                            )}
                          </Button>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {/* Analysis Tab */}
                {activeTab === "analysis" && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="p-2 sm:p-3 rounded-lg border bg-[#0093af]/10 border-[#0093af]/20">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 text-[#0093af]">
                          <Activity size={14} className="sm:w-4 sm:h-4" />
                          <span className="text-[10px] sm:text-xs font-medium">Scans</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          {scanProgress?.completedScans || 0}
                        </p>
                      </div>

                      <div className="p-2 sm:p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-green-600 dark:text-green-400 mb-1">
                          <Zap size={14} className="sm:w-4 sm:h-4" />
                          <span className="text-[10px] sm:text-xs font-medium">Found</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.opportunitiesFound}
                        </p>
                      </div>

                      <div className="p-2 sm:p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-purple-600 dark:text-purple-400 mb-1">
                          <ArrowRightLeft size={14} className="sm:w-4 sm:h-4" />
                          <span className="text-[10px] sm:text-xs font-medium">Avg %</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.avgProfitPercent}%
                        </p>
                      </div>

                      <div className="p-2 sm:p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-yellow-600 dark:text-yellow-400 mb-1">
                          <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                          <span className="text-[10px] sm:text-xs font-medium">Total</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          ${stats.totalProfit}
                        </p>
                      </div>
                    </div>

                    {stats.bestOpportunity && (
                      <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-[10px] sm:text-xs font-medium text-green-700 dark:text-green-300 mb-1 sm:mb-2">
                          🏆 Best Opportunity
                        </p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                          {stats.bestOpportunity.token}: {stats.bestOpportunity.profitPercent}%
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 truncate">
                          {stats.bestOpportunity.fromChainName} → {stats.bestOpportunity.toChainName}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Logs Tab */}
                {activeTab === "logs" && (
                  <div className="space-y-1.5 sm:space-y-2">
                    {activityLogs.length === 0 ? (
                      <div className="text-center py-8 sm:py-12">
                        <Activity className="mx-auto text-gray-400 mb-2 sm:mb-3" size={40} />
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No activity yet</p>
                        <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Logs will appear here
                        </p>
                      </div>
                    ) : (
                      activityLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs p-1.5 sm:p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800/50">
                          <div className="mt-0.5">{getLogIcon(log.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-800 dark:text-gray-200 break-words">{log.message}</p>
                            <p className="text-gray-400 dark:text-gray-500 text-[9px] sm:text-[10px]">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}