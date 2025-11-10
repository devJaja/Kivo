import axios from 'axios';

export class RealTimePriceOracle {
  private readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';
  private readonly DEFILLAMA_API = 'https://coins.llama.fi';
  
  // Token addresses by chain
  private readonly TOKEN_ADDRESSES: Record<string, Record<string, string>> = {
    '1': { // Ethereum
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    },
    '42161': { // Arbitrum
      USDC: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    },
    '10': { // Optimism
      USDC: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      WETH: '0x4200000000000000000000000000000000000006',
    },
    '137': { // Polygon
      USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    },
    '8453': { // Base
      USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
      WETH: '0x4200000000000000000000000000000000000006',
    },
  };

  async getRealTimePrice(chainId: string, tokenSymbol: string): Promise<number> {
    try {
      const tokenAddress = this.TOKEN_ADDRESSES[chainId]?.[tokenSymbol];
      if (!tokenAddress) {
        throw new Error(`Token ${tokenSymbol} not found on chain ${chainId}`);
      }

      // Use DeFiLlama for real-time prices (more accurate for DeFi)
      const response = await axios.get(
        `${this.DEFILLAMA_API}/prices/current/${this.getChainName(chainId)}:${tokenAddress}`
      );

      const priceData = response.data.coins[`${this.getChainName(chainId)}:${tokenAddress}`];
      
      if (!priceData?.price) {
        // Fallback to CoinGecko
        return await this.getCoinGeckoPrice(tokenSymbol);
      }

      return priceData.price;
    } catch (error) {
      console.error(`Error fetching price for ${tokenSymbol} on chain ${chainId}:`, error);
      // Fallback to CoinGecko
      return await this.getCoinGeckoPrice(tokenSymbol);
    }
  }

  private async getCoinGeckoPrice(tokenSymbol: string): Promise<number> {
    const coinIds: Record<string, string> = {
      USDC: 'usd-coin',
      USDT: 'tether',
      DAI: 'dai',
      WETH: 'weth',
      ETH: 'ethereum',
    };

    try {
      const response = await axios.get(
        `${this.COINGECKO_API}/simple/price`,
        {
          params: {
            ids: coinIds[tokenSymbol] || tokenSymbol.toLowerCase(),
            vs_currencies: 'usd',
          },
        }
      );

      const coinId = coinIds[tokenSymbol] || tokenSymbol.toLowerCase();
      return response.data[coinId]?.usd || 1.0;
    } catch (error) {
      console.error(`CoinGecko fallback failed for ${tokenSymbol}:`, error);
      return 1.0; // Final fallback
    }
  }

  private getChainName(chainId: string): string {
    const chainNames: Record<string, string> = {
      '1': 'ethereum',
      '42161': 'arbitrum',
      '10': 'optimism',
      '137': 'polygon',
      '8453': 'base',
    };
    return chainNames[chainId] || 'ethereum';
  }

  async getBatchPrices(
    tokens: string[],
    chains: string[]
  ): Promise<Map<string, Map<string, number>>> {
    const priceMap = new Map<string, Map<string, number>>();

    for (const chain of chains) {
      const chainPrices = new Map<string, number>();
      
      for (const token of tokens) {
        try {
          const price = await this.getRealTimePrice(chain, token);
          chainPrices.set(token, price);
          
          // Rate limiting - CoinGecko free tier allows 10-30 calls/minute
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
          console.error(`Failed to get price for ${token} on chain ${chain}`);
        }
      }
      
      priceMap.set(chain, chainPrices);
    }

    return priceMap;
  }
}