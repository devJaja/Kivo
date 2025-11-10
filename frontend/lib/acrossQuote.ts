import { ethers } from 'ethers';
import axios from 'axios';

export class RealAcrossQuote {
  private readonly ACROSS_API = 'https://across.to/api';
  
  async getQuote(params: {
    originChainId: number;
    destinationChainId: number;
    token: string;
    amount: string;
    recipient: string;
  }): Promise<{
    estimatedFillTime: number;
    relayerFee: string;
    lpFee: string;
    totalFee: string;
    netAmount: string;
    isAmountTooLow: boolean;
  } | null> {
    try {
      const response = await axios.get(`${this.ACROSS_API}/suggested-fees`, {
        params: {
          token: params.token,
          destinationChainId: params.destinationChainId,
          originChainId: params.originChainId,
          amount: ethers.parseUnits(params.amount, 6).toString(), // Assuming 6 decimals
          recipient: params.recipient,
        },
      });

      const data = response.data;

      if (!data || data.isAmountTooLow) {
        return { ...data, isAmountTooLow: true };
      }

      const totalFee = BigInt(data.relayerFee.total) + BigInt(data.lpFee.total);

      const netAmount = BigInt(params.amount) - totalFee;

      return {
        estimatedFillTime: data.estimatedFillTimeSec || 60,
        relayerFee: ethers.formatUnits(data.relayerFee.total, 6),
        lpFee: ethers.formatUnits(data.lpFee.total, 6),
        totalFee: ethers.formatUnits(totalFee, 6),
        netAmount: ethers.formatUnits(netAmount, 6),
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
  }>): Promise<Map<string, any>> {
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