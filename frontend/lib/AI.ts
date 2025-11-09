import { Alchemy, Network } from "alchemy-sdk";
import { AcrossBridgeService } from "./acrossBridge";

// lib/arbitrageAgent.js
export class ArbitrageAgent {
  constructor(bridgeService, smartAccount, alchemyApiKey) {
    this.bridgeService = bridgeService;
    this.smartAccount = smartAccount;
    this.alchemy = new Alchemy({
      apiKey: alchemyApiKey,
      network: Network.ETH_MAINNET, // or the appropriate network
    });
    this.isRunning = false;
    this.config = {
      minProfitPercent: 0.1,
      maxTradeAmount: 1000,
      scanInterval: 15000, // 15 seconds
      chains: [1, 10, 42161, 137, 8453], // Ethereum, Optimism, Arbitrum, Polygon, Base
    };
  }

  async start() {
    this.isRunning = true;
    this.scanLoop();
  }

  stop() {
    this.isRunning = false;
  }

  async scanLoop() {
    while (this.isRunning) {
      try {
        const opportunities = await this.scanOpportunities();
        
        for (const opp of opportunities) {
          if (opp.profitPercent >= this.config.minProfitPercent) {
            await this.executeArbitrage(opp);
          }
        }
      } catch (error) {
        console.error('Scan error:', error);
      }

      await new Promise(resolve => 
        setTimeout(resolve, this.config.scanInterval)
      );
    }
  }

  async scanOpportunities() {
    const opportunities = [];
    const tokens = ['USDC', 'USDT', 'DAI'];

    for (let i = 0; i < this.config.chains.length; i++) {
      for (let j = 0; j < this.config.chains.length; j++) {
        if (i === j) continue;

        const fromChain = this.config.chains[i];
        const toChain = this.config.chains[j];

        for (const token of tokens) {
          const opportunity = await this.analyzeRoute(
            fromChain,
            toChain,
            token
          );

          if (opportunity) {
            opportunities.push(opportunity);
          }
        }
      }
    }

    return opportunities.sort((a, b) => b.profitPercent - a.profitPercent);
  }

  async analyzeRoute(fromChain, toChain, token) {
    try {
      // Get prices on both chains
      const fromPrice = await this.getTokenPrice(fromChain, token);
      const toPrice = await this.getTokenPrice(toChain, token);

      // Get bridge quote
      const amount = 100; // Test with 100 tokens
      const quote = await this.bridgeService.getQuote({
        fromChain,
        toChain,
        token,
        amount,
      });

      // Calculate profit
      const costOnOrigin = amount * fromPrice;
      const valueOnDestination = quote.netAmount * toPrice;
      const profit = valueOnDestination - costOnOrigin - quote.fees;
      const profitPercent = (profit / costOnOrigin) * 100;

      if (profitPercent > 0) {
        return {
          fromChain,
          toChain,
          token,
          amount,
          profitPercent,
          estimatedProfit: profit,
          quote,
        };
      }
    } catch (error) {
      console.error(`Error analyzing route ${token} from ${fromChain} to ${toChain}:`, error);
    }

    return null;
  }

  async executeArbitrage(opportunity) {
    console.log('Executing arbitrage:', opportunity);

    try {
      // Execute bridge transaction via AA
      const txHash = await this.bridgeService.executeBridge(
        this.smartAccount,
        {
          fromChain: opportunity.fromChain,
          toChain: opportunity.toChain,
          token: opportunity.token,
          amount: opportunity.amount,
          recipient: this.smartAccount.address,
        }
      );

      console.log('Arbitrage executed:', txHash);
      return { success: true, txHash };
    } catch (error) {
      console.error('Execution failed:', error);
      return { success: false, error };
    }
  }

  async getTokenPrice(chainId, token) {
    // For simplicity, we'll use a mock price here. 
    // A real implementation would use a price oracle or DEX SDK.
    const mockPrices = {
      USDC: 1.0,
      USDT: 0.9999,
      DAI: 1.0001,
    };
    
    return mockPrices[token] * (1 + (Math.random() - 0.5) * 0.01);
  }
}