"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";

export const useAiAgent = () => {
  const { user } = usePrivy();
  const { address, isConnected, chainId } = useAccount();
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user && isConnected) {
      // AI agent can now access user and wallet information
      console.log("AI Agent: Wallet connected for user:", user.id);
      console.log("AI Agent: Connected address:", address);
      console.log("AI Agent: Connected chainId:", chainId);
    } else {
      console.log("AI Agent: Wallet not connected.");
    }
  }, [user, isConnected, address, chainId]);

  const sendMessageToAi = async (message: string) => {
    setIsLoading(true);
    setAiResponse(null);

    // Simulate AI processing and response
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

    let response = `AI received your message: "${message}".`;

    if (message.toLowerCase().includes("balance")) {
      response += ` Your current wallet address is ${address}. I can help you check your balance if you connect your wallet.`;
    } else if (message.toLowerCase().includes("send")) {
      response += ` To send funds, please specify the recipient and amount.`;
    } else if (message.toLowerCase().includes("swap")) {
      response += ` To swap tokens, please specify the tokens and amounts.`;
    } else {
      response += ` How can I assist you further with your wallet?`;
    }

    setAiResponse(response);
    setIsLoading(false);
  };

  return {
    aiResponse,
    isLoading,
    sendMessageToAi,
    walletAddress: address,
    isConnectedToWallet: isConnected,
  };
};