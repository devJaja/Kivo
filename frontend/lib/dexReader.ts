import { ethers } from "ethers";
import { CHAINS, DEXS, TOKENS } from '../config';

const UNISWAP_V3_QUOTER_ABI = [
  "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)"
];

class DEXReader {
  private providers: Map<string, ethers.JsonRpcProvider>;

  constructor() {
    this.providers = new Map();
    Object.keys(CHAINS).forEach((chainKey) => {
      const chain = CHAINS[chainKey as keyof typeof CHAINS];
      this.providers.set(chain.name, new ethers.JsonRpcProvider(chain.rpc));
    });
  }

  async getPrice(chainName: keyof typeof CHAINS, tokenInSymbol: string, tokenOutSymbol: string, amountIn: number = 1): Promise<number | null> {
    const provider = this.providers.get(chainName);
    const chainDEXs = DEXS[chainName];
    const chainTokens = TOKENS[chainName];

    if (!provider || !chainDEXs || !chainTokens) {
      console.error(`Invalid chain: ${chainName}`);
      return null;
    }

    const tokenIn = chainTokens[tokenInSymbol as keyof typeof chainTokens];
    const tokenOut = chainTokens[tokenOutSymbol as keyof typeof chainTokens];
    const primaryDEX = chainDEXs.find(dex => dex.type === 'v3'); // Prefer V3 for quoting

    if (!tokenIn || !tokenOut || !primaryDEX) {
      console.error(`Tokens or primary DEX not found on ${chainName}`);
      return null;
    }

    try {
      const quoter = new ethers.Contract(primaryDEX.router, UNISWAP_V3_QUOTER_ABI, provider);
      
      // We need decimals to format the amount correctly
      // This is a simplified example, a real implementation would need to fetch decimals
      const tokenInDecimals = tokenInSymbol === 'USDC' ? 6 : 18;
      const tokenOutDecimals = tokenOutSymbol === 'USDC' ? 6 : 18;

      const amountInWei = ethers.parseUnits(amountIn.toString(), tokenInDecimals);

      const amountOutWei = await quoter.quoteExactInputSingle.staticCall(
        tokenIn,
        tokenOut,
        3000, // Assume 0.3% fee tier
        amountInWei,
        0
      );

      return parseFloat(ethers.formatUnits(amountOutWei, tokenOutDecimals));
    } catch (error) {
      console.error(`Error getting price from ${primaryDEX.name} on ${chainName}:`, error);
      return null;
    }
  }
}

export const dexReader = new DEXReader();
