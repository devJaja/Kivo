import axios from 'axios';

export class RealTimePriceOracle {
  private readonly DEFILLAMA_API = 'https://coins.llama.fi';
  
  // Token addresses by chain
  private readonly TOKEN_ADDRESSES: Record<string, Record<string, string>> = {
    '1': { // Ethereum
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      LINK: '0x514910771AF9Ca656af840dff83E8264dCefFf6f',
      UNI: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', // Standard UNI V2 Router 2 (dummy)
      PEPE: '0x0000000000000000000000000000000000000000', // Placeholder
      AERO: '0x0000000000000000000000000000000000000000', // Placeholder
      WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      BRETT: '0x0000000000000000000000000000000000000000', // Placeholder
    },
    '42161': { // Arbitrum
      USDC: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      LINK: '0xf97f4df75117a78c1a5a0dbb814f8be5c179f7fc',
      UNI: '0x0000000000000000000000000000000000000000', // Placeholder
      PEPE: '0x0000000000000000000000000000000000000000', // Placeholder
      AERO: '0x0000000000000000000000000000000000000000', // Placeholder
      WBTC: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
      BRETT: '0x0000000000000000000000000000000000000000', // Placeholder
    },
    '10': { // Optimism
      USDC: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      WETH: '0x4200000000000000000000000000000000000006',
      LINK: '0x0000000000000000000000000000000000000000', // Placeholder
      UNI: '0x0000000000000000000000000000000000000000', // Placeholder
      PEPE: '0x0000000000000000000000000000000000000000', // Placeholder
      AERO: '0x0000000000000000000000000000000000000000', // Placeholder
      WBTC: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
      BRETT: '0x0000000000000000000000000000000000000000', // Placeholder
    },
    '137': { // Polygon
      USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      LINK: '0x0000000000000000000000000000000000000000', // Placeholder
      UNI: '0x0000000000000000000000000000000000000000', // Placeholder
      PEPE: '0x0000000000000000000000000000000000000000', // Placeholder
      AERO: '0x0000000000000000000000000000000000000000', // Placeholder
      WBTC: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
      BRETT: '0x0000000000000000000000000000000000000000', // Placeholder
    },
    '8453': { // Base
      USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
      WETH: '0x4200000000000000000000000000000000000006',
      LINK: '0x0000000000000000000000000000000000000000', // Placeholder
      UNI: '0x0000000000000000000000000000000000000000', // Placeholder
      PEPE: '0x0000000000000000000000000000000000000000', // Placeholder
      AERO: '0x940181a94a35a4569e4529a3cdfb74e38fd98631',
      WBTC: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
      BRETT: '0x532f27101965dd16442E59d40670FaF5eBB142E4',
    },
    '43114': { // Avalanche - Added to TOKEN_ADDRESSES
      USDC: '0xB97EF9e873419088CeE5dDde4AAfA2F8D2917d2F', // Common USDC on Avalanche
      USDT: '0x9702230a8ada49a535b9add6519fcd247fd43aea', // Common USDT on Avalanche
      DAI: '0xd586e7f844cea2f87f50152665bcbc2c279d8704', // Common DAI on Avalanche
      WETH: '0x49D5c2BdF27Ff2070f26f672EF1376dF79a07aB3', // WETH.e on Avalanche
      LINK: '0x0000000000000000000000000000000000000000', // Placeholder
      UNI: '0x0000000000000000000000000000000000000000', // Placeholder
      PEPE: '0x0000000000000000000000000000000000000000', // Placeholder
      AERO: '0x0000000000000000000000000000000000000000', // Placeholder
      WBTC: '0x50b7545627a5162f82a992c33b87adc75187b218',
      BRETT: '0x0000000000000000000000000000000000000000', // Placeholder
    },
    '84532': { // Base Sepolia - PLACEHOLDER ADDRESSES, UPDATE WITH ACTUAL TESTNET TOKENS
      USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Using Base Mainnet USDC as placeholder
      USDT: '0x0000000000000000000000000000000000000000', // Placeholder
      WETH: '0x4200000000000000000000000000000000000006', // Placeholder
      LINK: '0x0000000000000000000000000000000000000000', // Placeholder
      UNI: '0x0000000000000000000000000000000000000000', // Placeholder
      PEPE: '0x0000000000000000000000000000000000000000', // Placeholder
    },
    '11155111': { // Sepolia
      USDC: '0x0000000000000000000000000000000000000000', // Placeholder
      USDT: '0x0000000000000000000000000000000000000000', // Placeholder
      WETH: '0x7b79995e5f793A07Bc00c21412e50Eaae098E7f9',
      LINK: '0x0000000000000000000000000000000000000000', // Placeholder
      UNI: '0x0000000000000000000000000000000000000000', // Placeholder
      PEPE: '0x0000000000000000000000000000000000000000', // Placeholder
    },
  }

  public getTokenAddress(chainId: string, tokenSymbol: string): string | undefined;
  public getTokenAddress(chainId: string): Record<string, string> | undefined;
  public getTokenAddress(chainId: string, tokenSymbol?: string): string | Record<string, string> | undefined {
    if (tokenSymbol) {
      return this.TOKEN_ADDRESSES[chainId]?.[tokenSymbol];
    }
    return this.TOKEN_ADDRESSES[chainId];
  }

  public getSupportedTokens(chainId: string): string[] {
    return Object.keys(this.TOKEN_ADDRESSES[chainId] || {});
  }

  private async getPricesFromApi(tokens: string[]): Promise<Record<string, number>> {
    try {
      const response = await axios.get('/api/prices', {
        params: {
          tokens: tokens.join(','),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching prices from API route:', error);
      return {};
    }
  }

  private getChainName(chainId: string): string {
    const chainNames: Record<string, string> = {
      '1': 'ethereum',
      '42161': 'arbitrum',
      '10': 'optimism',
      '137': 'polygon',
      '8453': 'base',
      '84532': 'baseSepolia', // Added Base Sepolia
    };
    return chainNames[chainId] || 'ethereum';
  }

  // New method to get WETH price
  async getEthPrice(): Promise<number | undefined> {
    try {
      const prices = await this.getPricesFromApi(['WETH']);
      return prices['weth'];
    } catch (error) {
      console.error('Error fetching WETH price:', error);
      return undefined;
    }
  }

  async getBatchPrices(
    tokens: string[],
    chains: string[]
  ): Promise<Map<string, Map<string, number>>> {
    const priceMap = new Map<string, Map<string, number>>();
    const allTokens = new Set<string>();
    tokens.forEach(token => allTokens.add(token));

    const prices = await this.getPricesFromApi(Array.from(allTokens));

    for (const chain of chains) {
      const chainPrices = new Map<string, number>();
      for (const token of tokens) {
        const tokenPrice = prices[token.toLowerCase()];
        if (tokenPrice) {
          chainPrices.set(token, tokenPrice);
        } else {
          console.warn(`Could not find price for ${token} on chain ${chain}`);
        }
      }
      priceMap.set(chain, chainPrices);
    }

    return priceMap;
  }
}