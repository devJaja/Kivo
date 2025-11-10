"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, Send, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useAiAgent } from "@/hooks/use-ai-agent"

// Local reusable UI components
const Button = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  type?: "button" | "submit"
  disabled?: boolean
  className?: string
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-2 rounded-md bg-primary text-white font-medium hover:opacity-90 transition disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
)

const Input = ({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  className = "",
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: string
  disabled?: boolean
  className?: string
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
  />
)

export default function AIAssistant() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([])
  const { aiResponse, isLoading, sendMessageToAi, isConnectedToWallet } = useAiAgent()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (aiResponse) {
      setMessages((prev) => [...prev, { sender: "ai", text: aiResponse }])
    }
  }, [aiResponse])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim() === "") return

    setMessages((prev) => [...prev, { sender: "user", text: inputMessage }])
    await sendMessageToAi(inputMessage)
    setInputMessage("")
  }

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="fixed bottom-6 right-6 z-30"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAssistantOpen(!isAssistantOpen)}
          className="relative p-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-shadow"
          style={{
            animation: "float-pulse 2s ease-in-out infinite",
          }}
        >
          <MessageCircle size={24} />
        </motion.button>
      </motion.div>

      {/* Assistant Chat Box */}
      <AnimatePresence>
        {isAssistantOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 w-80 h-96 bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col z-40"
          >
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Kivo AI Assistant</h3>
              <Button
                className="bg-transparent text-gray-600 hover:bg-gray-100"
                onClick={() => setIsAssistantOpen(false)}
              >
                <X size={20} />
              </Button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto">
              {!isConnectedToWallet && (
                <div className="text-center text-sm text-gray-500 mb-4">
                  Connect your wallet to enable full AI assistant features.
                </div>
              )}

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}
                >
                  <span
                    className={`inline-block p-2 rounded-lg ${
                      msg.sender === "user"
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {msg.text}
                  </span>
                </div>
              ))}

              {isLoading && (
                <div className="text-left mb-2">
                  <span className="inline-block p-2 rounded-lg bg-gray-100 text-gray-600">
                    AI is typing...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Kivo AI..."
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading} className="bg-indigo-500 hover:bg-indigo-600">
                <Send size={18} />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
