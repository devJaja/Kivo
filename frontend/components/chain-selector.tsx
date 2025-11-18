"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useSwitchChain, useAccount } from "wagmi";
import { wagmiConfig } from "@/hooks/wagmiConfig";

export default function ChainSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = usePrivy();
  const { chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  const currentChain = wagmiConfig.chains.find(
    (c) => c.id === chainId
  );

  const chains = wagmiConfig.chains;

  const handleSwitchChain = (id: number) => {
    if (isConnected) {
      switchChain({ chainId: id });
    } else {
      console.log("Wallet not connected, cannot switch chain via wagmi");
    }
    setIsOpen(false);
  };


  return (
      <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors"
      >
        <span className="text-xl">{currentChain?.nativeCurrency.symbol}</span>
        <span className="font-medium text-foreground">{currentChain?.name}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-muted-foreground" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
            >
              {chains.map((chain, index) => (
                <motion.button
                  key={chain.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSwitchChain(chain.id)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/10 transition-colors text-left ${
                    chainId === chain.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                  }`}
                >
                  <span className="text-xl">{chain.nativeCurrency.symbol}</span>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{chain.name}</p>
                    <p className="text-xs text-muted-foreground">{chain.nativeCurrency.symbol}</p>
                  </div>
                  {chainId === chain.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
          </>
        )}
      </AnimatePresence>
    </div>
  
  );
}

// export default ChainSelector
