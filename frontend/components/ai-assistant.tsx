"use client";

// import { motion, AnimatePresence } from "framer-motion"
// import { MessageCircle, Send, X } from "lucide-react"
// import { useState, useEffect, useRef } from "react"
// import { useAiAgent } from "@/hooks/use-ai-agent"

// // Local reusable UI components
// const Button = ({
//   children,
//   onClick,
//   type = "button",
//   disabled = false,
//   className = "",
// }: {
//   children: React.ReactNode
//   onClick?: () => void
//   type?: "button" | "submit"
//   disabled?: boolean
//   className?: string
// }) => (
//   <button
//     type={type}
//     onClick={onClick}
//     disabled={disabled}
//     className={`px-3 py-2 rounded-md bg-primary text-white font-medium hover:opacity-90 transition disabled:opacity-50 ${className}`}
//   >
//     {children}
//   </button>
// )

// const Input = ({
//   value,
//   onChange,
//   placeholder,
//   type = "text",
//   disabled = false,
//   className = "",
// }: {
//   value: string
//   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
//   placeholder?: string
//   type?: string
//   disabled?: boolean
//   className?: string
// }) => (
//   <input
//     type={type}
//     value={value}
//     onChange={onChange}
//     placeholder={placeholder}
//     disabled={disabled}
//     className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
//   />
// )

// export default function AIAssistant() {
//   const [isAssistantOpen, setIsAssistantOpen] = useState(false)
//   const [inputMessage, setInputMessage] = useState("")
//   const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([])
//   const { aiResponse, isLoading, sendMessageToAi, isConnectedToWallet } = useAiAgent()
//   const messagesEndRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     if (aiResponse) {
//       setMessages((prev) => [...prev, { sender: "ai", text: aiResponse }])
//     }
//   }, [aiResponse])

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }, [messages])

//   const handleSendMessage = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (inputMessage.trim() === "") return

//     setMessages((prev) => [...prev, { sender: "user", text: inputMessage }])
//     await sendMessageToAi(inputMessage)
//     setInputMessage("")
//   }

//   return (
//     <>
//       {/* Floating Chat Button */}
//       <motion.div
//         initial={{ scale: 0, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ delay: 0.6, duration: 0.5 }}
//         className="fixed bottom-6 right-6 z-30"
//       >
//         <motion.button
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={() => setIsAssistantOpen(!isAssistantOpen)}
//           className="relative p-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-shadow"
//           style={{
//             animation: "float-pulse 2s ease-in-out infinite",
//           }}
//         >
//           <MessageCircle size={24} />
//         </motion.button>
//       </motion.div>

//       {/* Assistant Chat Box */}
//       <AnimatePresence>
//         {isAssistantOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: 50, scale: 0.9 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 50, scale: 0.9 }}
//             transition={{ duration: 0.3 }}
//             className="fixed bottom-24 right-6 w-80 h-96 bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col z-40"
//           >
//             <div className="flex justify-between items-center p-3 border-b border-gray-200">
//               <h3 className="text-lg font-semibold">Kivo AI Assistant</h3>
//               <Button
//                 className="bg-transparent text-gray-600 hover:bg-gray-100"
//                 onClick={() => setIsAssistantOpen(false)}
//               >
//                 <X size={20} />
//               </Button>
//             </div>

//             <div className="flex-1 p-3 overflow-y-auto">
//               {!isConnectedToWallet && (
//                 <div className="text-center text-sm text-gray-500 mb-4">
//                   Connect your wallet to enable full AI assistant features.
//                 </div>
//               )}

//               {messages.map((msg, index) => (
//                 <div
//                   key={index}
//                   className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}
//                 >
//                   <span
//                     className={`inline-block p-2 rounded-lg ${
//                       msg.sender === "user"
//                         ? "bg-indigo-500 text-white"
//                         : "bg-gray-100 text-gray-900"
//                     }`}
//                   >
//                     {msg.text}
//                   </span>
//                 </div>
//               ))}

//               {isLoading && (
//                 <div className="text-left mb-2">
//                   <span className="inline-block p-2 rounded-lg bg-gray-100 text-gray-600">
//                     AI is typing...
//                   </span>
//                 </div>
//               )}

//               <div ref={messagesEndRef} />
//             </div>

//             <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex gap-2">
//               <Input
//                 value={inputMessage}
//                 onChange={(e) => setInputMessage(e.target.value)}
//                 placeholder="Ask Kivo AI..."
//                 disabled={isLoading}
//               />
//               <Button type="submit" disabled={isLoading} className="bg-indigo-500 hover:bg-indigo-600">
//                 <Send size={18} />
//               </Button>
//             </form>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   )
// }
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  CheckCircle,
  AlertTriangle,
  Activity,
  ArrowRightLeft,
  Loader2,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";
import Button from "./ui/button";
import {
  useArbitrageAgent,
  AgentSuggestion,
  ActivityLog,
} from "@/hooks/use-arbitrage-agent";

export default function EnhancedAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"opportunities" | "analysis" | "logs">("opportunities");

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
      totalProfit,
      avgProfitPercent,
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
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow"
      >
        <Zap size={24} />
        {isScanning && (
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
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
            className="absolute bottom-full right-0 mb-4 w-[450px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Zap size={20} />
                    AI Arbitrage Agent
                  </h3>
                  <p className="text-sm text-indigo-100">
                    {isScanning ? "Scanning for opportunities..." : "Ready to scan"}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Controls */}
              <div className="mt-3 flex gap-2">
                {!isScanning ? (
                  <button
                    onClick={startScanning}
                    className="flex-1 px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                  >
                    <Activity size={16} />
                    Start Scanning
                  </button>
                ) : (
                  <button
                    onClick={stopScanning}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    Stop
                  </button>
                )}
              </div>
            </div>

            {/* Scan Progress */}
            {isScanning && scanProgress && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    {scanProgress.currentChain} • {scanProgress.currentToken}
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                    {scanProgress.completedScans}/{scanProgress.totalScans}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(scanProgress.completedScans / scanProgress.totalScans) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>{scanProgress.routesAnalyzed} routes analyzed</span>
                  <span>{stats.opportunitiesFound} opportunities found</span>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800">
              {["opportunities", "analysis", "logs"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition ${
                    activeTab === tab
                      ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4 max-h-[500px] overflow-y-auto">
              {/* Opportunities Tab */}
              {activeTab === "opportunities" && (
                <div className="space-y-3">
                  {suggestions.length === 0 ? (
                    <div className="text-center py-12">
                      <Activity className="mx-auto text-gray-400 mb-3" size={48} />
                      <p className="text-gray-500 dark:text-gray-400">
                        {isScanning ? "Scanning..." : "No opportunities yet"}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Start scanning to find arbitrage opportunities
                      </p>
                    </div>
                  ) : (
                    suggestions.map((suggestion) => (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              <ArrowRightLeft size={14} />
                              {suggestion.token}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {suggestion.fromChainName} → {suggestion.toChainName}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(
                              suggestion.riskLevel
                            )}`}
                          >
                            {suggestion.riskLevel}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Profit:</span>
                            <p className="font-bold text-green-600 dark:text-green-400">
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
                            <span className="text-gray-500 dark:text-gray-400">Bridge Fee:</span>
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
                          className="w-full px-4 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition disabled:opacity-50"
                          onClick={() => executeSuggestion(suggestion)}
                          disabled={executingId === suggestion.id}
                        >
                          {executingId === suggestion.id ? (
                            <>
                              <Loader2 size={16} className="animate-spin mr-2" />
                              Executing...
                            </>
                          ) : (
                            <>
                              <Zap size={16} className="mr-2" />
                              Execute Arbitrage
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
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                        <Activity size={16} />
                        <span className="text-xs font-medium">Total Scans</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {scanProgress?.completedScans || 0}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                        <Zap size={16} />
                        <span className="text-xs font-medium">Opportunities</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.opportunitiesFound}
                      </p>
                    </div>
                  </div>
                  {/* Additional stats can be added here */}
                </div>
              )}

              {/* Logs Tab */}
              {activeTab === "logs" && (
                <div className="space-y-2">
                  {activityLogs.length === 0 ? (
                     <div className="text-center py-12">
                       <Activity className="mx-auto text-gray-400 mb-3" size={48} />
                       <p className="text-gray-500 dark:text-gray-400">No activity yet</p>
                     </div>
                  ) : (
                    activityLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2 text-xs">
                        <div className="mt-0.5">{getLogIcon(log.type)}</div>
                        <div className="flex-1">
                          <p className="text-gray-800 dark:text-gray-200">{log.message}</p>
                          <p className="text-gray-400 dark:text-gray-500">
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
  );
}

