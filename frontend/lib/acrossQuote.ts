import { ethers } from 'ethers';
import axios from 'axios';

export interface Quote {
  estimatedFillTime: number;
  relayerFee: string;
  lpFee: string;
  totalFee: string;
  netAmount: string;
  isAmountTooLow: boolean;
}

export class RealAcrossQuote {
  private readonly ACROSS_API = 'https://across.to/api';
  
  async getQuote(params: {
    originChainId: number;
    destinationChainId: number;
    token: string;
    amount: string;
    recipient: string;
    decimals: number; // Add decimals parameter
  }): Promise<Quote | null> {
    try {
      const response = await axios.get(`${this.ACROSS_API}/suggested-fees`, {
        params: {
          token: params.token,
          destinationChainId: params.destinationChainId,
          originChainId: params.originChainId,
          amount: ethers.parseUnits(params.amount, params.decimals).toString(), // Use dynamic decimals
          recipient: params.recipient,
        },
      });

      const data = response.data;

      if (!data || data.isAmountTooLow) {
        return { ...data, isAmountTooLow: true };
      }

      const totalFee = BigInt(data.relayerFee.total) + BigInt(data.lpFee.total);

      const netAmount = BigInt(ethers.parseUnits(params.amount, params.decimals).toString()) - totalFee; // Use parsed amount for net amount calculation

      return {
        estimatedFillTime: data.estimatedFillTimeSec || 60,
        relayerFee: ethers.formatUnits(data.relayerFee.total, params.decimals), // Use dynamic decimals
        lpFee: ethers.formatUnits(data.lpFee.total, params.decimals), // Use dynamic decimals
        totalFee: ethers.formatUnits(totalFee, params.decimals), // Use dynamic decimals
        netAmount: ethers.formatUnits(netAmount, params.decimals), // Use dynamic decimals
        isAmountTooLow: false,
      };
    } catch (error) {
      console.error('Error fetching Across quote:', error);
      return null;
    }
  }

  async getMultipleQuotes(routes: Array<{
    originChainId: number;
    destinationChainId: number;
    token: string;
    amount: string;
    recipient: string;
    decimals: number; // Add decimals to route
  }>): Promise<Map<string, Quote | null>> {
    const quotes = new Map();

    for (const route of routes) {
      const routeKey = `${route.originChainId}-${route.destinationChainId}-${route.token}`;
      const quote = await this.getQuote(route);
      quotes.set(routeKey, quote);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return quotes;
  }
}