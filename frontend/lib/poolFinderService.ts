import { ethers } from 'ethers';
import { config } from '../config';

const FACTORY_ABI = [
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)"
];


const POOL_ABI = [
  "function liquidity() external view returns (uint128)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function fee() external view returns (uint24)"
];

const ERC20_ABI = [
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function balanceOf(address account) external view returns (uint256)"
];

interface PoolInfo {
  address: string;
  fee: number;
  liquidity: bigint;
  token0: string;
  token1: string;
  token0Balance: bigint;
  token1Balance: bigint;
  exists: boolean;
}

export class PoolFinderService {
  private provider: ethers.JsonRpcProvider;
  private factory: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.RPC_URL);
    this.factory = new ethers.Contract(
      config.UNISWAP_V3_FACTORY,
      FACTORY_ABI,
  new ethers.JsonRpcProvider(config.RPC_URL)
    );
  }

  /**
   * Find all pools for a token pair across different fee tiers
   */
  async findAllPools(tokenA: string, tokenB: string): Promise<PoolInfo[]> {
    const feeTiers = [500, 3000, 10000]; // 0.05%, 0.3%, 1%
    const pools: PoolInfo[] = [];

    console.log(`
🔍 Searching for pools: ${tokenA} / ${tokenB}\n`);
    console.log("URL",this.provider)
    console.log("Url2", config.RPC_URL)

    for (const fee of feeTiers) {
      try {
        const poolAddress = await this.factory.getPool(tokenA, tokenB, fee);

        if (poolAddress === ethers.ZeroAddress) {
          console.log(`❌ ${fee / 10000}% pool: Does not exist`);
          continue;
        }

        console.log(`✅ ${fee / 10000}% pool found: ${poolAddress}`);

        // Get pool details
        const poolInfo = await this.getPoolDetails(poolAddress, fee);
        pools.push(poolInfo);

      } catch (error) {
        console.log(`❌ Error checking ${fee / 10000}% pool:`, error);
      }
    }

    return pools;
  }

  /**
   * Get detailed information about a specific pool
   */
  async getPoolDetails(poolAddress: string, fee: number): Promise<PoolInfo> {
    const pool = new ethers.Contract(poolAddress, POOL_ABI, this.provider);

    try {
      // Get pool tokens
      const token0Address = await pool.token0();
      const token1Address = await pool.token1();

      // Get token contracts
      const token0 = new ethers.Contract(token0Address, ERC20_ABI, this.provider);
      const token1 = new ethers.Contract(token1Address, ERC20_ABI, this.provider);

      // Get token balances in the pool
      const token0Balance = await token0.balanceOf(poolAddress);
      const token1Balance = await token1.balanceOf(poolAddress);

      // Get pool liquidity (this is a measure of active liquidity)
      const liquidity = await pool.liquidity();

      console.log(`   Token0 Balance: ${ethers.formatUnits(token0Balance, 18)}`);
      console.log(`   Token1 Balance: ${ethers.formatUnits(token1Balance, 6)}`);
      console.log(`   Liquidity: ${liquidity.toString()}`);

      return {
        address: poolAddress,
        fee,
        liquidity,
        token0: token0Address,
        token1: token1Address,
        token0Balance,
        token1Balance,
        exists: true
      };

    } catch (error) {
      console.log(`   ⚠️  Could not get pool details:`, error);
      return {
        address: poolAddress,
        fee,
        liquidity: 0n,
        token0: '',
        token1: '',
        token0Balance: 0n,
        token1Balance: 0n,
        exists: false
      };
    }
  }

  /**
   * Find the best pool (highest liquidity)
   */
  findBestPool(pools: PoolInfo[]): PoolInfo | null {
    if (pools.length === 0) {
      return null;
    }

    // Filter out pools without liquidity data
    const validPools = pools.filter(p => p.exists && p.liquidity > 0n);

    if (validPools.length === 0) {
      return null;
    }

    // Sort by liquidity (descending)
    validPools.sort((a, b) => {
      if (a.liquidity > b.liquidity) return -1;
      if (a.liquidity < b.liquidity) return 1;
      return 0;
    });

    return validPools[0];
  }

  /**
   * Main function: Find the best pool for a token pair
   */
  async findBestPoolForPair(tokenA: string, tokenB: string): Promise<PoolInfo | null> {
    console.log('═══════════════════════════════════════════');
    console.log('  FINDING BEST UNISWAP V3 POOL');
    console.log('═══════════════════════════════════════════');

    // Find all pools
    const pools = await this.findAllPools(tokenA, tokenB);

    if (pools.length === 0) {
      console.log('\n❌ No pools found for this pair');
      return null;
    }

    // Find best pool
    const bestPool = this.findBestPool(pools);

    if (!bestPool) {
      console.log('\n❌ No valid pools with liquidity found');
      return null;
    }

    console.log('\n🏆 BEST POOL:');
    console.log('═══════════════════════════════════════════');
    console.log(`Address: ${bestPool.address}`);
    console.log(`Fee Tier: ${bestPool.fee / 10000}%`);
    console.log(`Liquidity: ${bestPool.liquidity.toString()}`);
    console.log('═══════════════════════════════════════════\n');

    return bestPool;
  }
}
