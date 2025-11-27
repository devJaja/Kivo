import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize GoogleGenerativeAI with your API key
// For client-side, typically load from environment variable or secure config
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
} else {
  console.error("GEMINI_API_KEY is not set. Gemini AI functionality will be disabled.");
}

export function useGeminiAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = useCallback(async (prompt: string): Promise<string | null> => {
    if (!genAI) {
      setError("Gemini AI is not initialized. API Key might be missing.");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro"}); // Use gemini-pro or another suitable model
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return text;
    } catch (err: any) {
      console.error("Error calling Gemini AI:", err);
      setError(err.message || "Failed to get response from Gemini AI.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generateContent,
    isLoading,
    error,
  };
}
