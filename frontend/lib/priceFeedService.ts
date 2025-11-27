import { HermesClient } from "@pythnetwork/hermes-client";
import { CHAINS, PYTH_CONFIG } from "../config";

export class PriceFeedService {
  private client: HermesClient;

  constructor(endpoint: string = PYTH_CONFIG.endpoint) {
    this.client = new HermesClient(endpoint, { timeout: 15000 });
  }

  /**
   * Get the latest WETH/USDC price from Pyth oracle for a specific chain.
   * @param chainName The name of the chain ('base', 'arbitrum', etc.)
   * @returns The price as a number, or null if not found.
   */
  async getWethUsdcPrice(chainName: keyof typeof CHAINS): Promise<number | null> {
    const priceId = PYTH_CONFIG.priceIds["WETH/USDC"][chainName];
    if (!priceId) {
      console.error(`No Pyth price ID found for WETH/USDC on chain ${chainName}`);
      return null;
    }

    try {
      const priceFeeds = await this.client.getLatestPriceUpdates([priceId]);
      
      if (!priceFeeds || priceFeeds.length === 0) {
        console.warn(`Pyth price data not found for ${chainName}`);
        return null;
      }

      const priceData = (priceFeeds[0] as any).getPriceNoOlderThan(60); // Get price if not older than 60s
      if (!priceData) {
        console.warn(`Pyth price is stale for ${chainName}`);
        return null;
      }
      
      // The price is calculated as price * 10^expo
      const price = Number(priceData.price) * (10 ** priceData.expo);

      console.log(`Oracle Price (WETH/USDC on ${chainName}): $${price.toFixed(2)}`);
      return price;

    } catch (error) {
      console.error(`Error fetching Pyth price for ${chainName}:`, error);
      return null;
    }
  }
}