import { NextResponse } from 'next/server';
import axios from 'axios';

// Cache to store prices and their timestamps
const cache = new Map<string, { price: number; timestamp: number }>();
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const COINMARKETCAP_API = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';
// TODO: Replace with your CoinMarketCap API key
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || 'YOUR_CMC_API_KEY';

async function fetchPricesFromCoinGecko(tokensToFetch: string[], coinSymbols: Record<string, string>) {
  const idsToFetch = tokensToFetch.map(t => coinSymbols[t.toUpperCase()] || t.toLowerCase()).join(',');
  const prices: { [key: string]: number } = {};

  try {
    let response;
    let attempts = 0;
    const maxAttempts = 3;
    const delay = 1000; // 1 second

    while (attempts < maxAttempts) {
      try {
        response = await axios.get(`${COINGECKO_API}/simple/price`, {
          params: {
            ids: idsToFetch,
            vs_currencies: 'usd',
          },
          timeout: 8000, // Add a timeout of 8 seconds
        });
        if (response) break; // If successful, break the loop
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error; // If max attempts reached, throw the error
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    if (response) {
      for (const token of tokensToFetch) {
        const coinId = coinSymbols[token.toUpperCase()] || token.toLowerCase();
        if (response.data[coinId]) {
          const price = response.data[coinId].usd;
          prices[token.toLowerCase()] = price;
          cache.set(token.toLowerCase(), { price, timestamp: Date.now() });
        }
      }
    }
    return prices;
  } catch (error) {
    console.error('Error fetching prices from CoinGecko:', error);
    return null;
  }
}

async function fetchPricesFromCoinMarketCap(tokensToFetch: string[]) {
  const symbolsToFetch = tokensToFetch.join(',');
  const prices: { [key: string]: number } = {};

  try {
    const response = await axios.get(COINMARKETCAP_API, {
      headers: {
        'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
      },
      params: {
        symbol: symbolsToFetch,
        convert: 'USD',
      },
      timeout: 8000,
    });

    if (response.data && response.data.data) {
      for (const token of tokensToFetch) {
        const upperToken = token.toUpperCase();
        if (response.data.data[upperToken]) {
          const price = response.data.data[upperToken].quote.USD.price;
          prices[token.toLowerCase()] = price;
          cache.set(token.toLowerCase(), { price, timestamp: Date.now() });
        }
      }
    }
    return prices;
  } catch (error) {
    console.error('Error fetching prices from CoinMarketCap:', error);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokens = searchParams.get('tokens');

  if (!tokens) {
    return NextResponse.json({ error: 'Missing tokens query parameter' }, { status: 400 });
  }

  const tokenList = tokens.split(',');
  let prices: { [key: string]: number } = {};
  const tokensToFetch = [];

  // Check cache first
  for (const token of tokenList) {
    const cached = cache.get(token.toLowerCase());
    if (cached && (Date.now() - cached.timestamp < 60000)) { // 1 minute cache
      prices[token.toLowerCase()] = cached.price;
    } else {
      tokensToFetch.push(token);
    }
  }

  // Fetch prices for tokens not in cache
  if (tokensToFetch.length > 0) {
    const coinSymbols: Record<string, string> = {
        USDC: 'usd-coin',
        USDT: 'tether',
        DAI: 'dai',
        WETH: 'weth',
        ETH: 'ethereum',
        LINK: 'chainlink',
        UNI: 'uniswap',
        PEPE: 'pepe',
        AERO: 'aerodrome-finance',
        WBTC: 'wrapped-bitcoin',
        BRETT: 'brett-base',
      };

    let fetchedPrices = await fetchPricesFromCoinGecko(tokensToFetch, coinSymbols);

    if (!fetchedPrices) {
      fetchedPrices = await fetchPricesFromCoinMarketCap(tokensToFetch);
    }

    if (fetchedPrices) {
      prices = { ...prices, ...fetchedPrices };
    }
  }

  return NextResponse.json(prices);
}