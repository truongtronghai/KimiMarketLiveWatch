import type { HoldingPosition } from './types';
import { getQuote } from './quotes';

const BASE_HOLDINGS: Array<Pick<HoldingPosition, 'symbol' | 'name'>> = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
];

function seededRandom(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state * 1103515245 + 12345) & 2147483647;
    return state / 2147483647;
  };
}

export function getHoldings(): HoldingPosition[] {
  return BASE_HOLDINGS.map((holding, index) => {
    const random = seededRandom(900 + index * 13);
    const quote = getQuote(holding.symbol);
    const previousClose = quote?.previousClose ?? 100;
    return {
      symbol: holding.symbol,
      name: holding.name,
      shares: (index + 2) * 60,
      costPerShare: Number(
        (previousClose * (0.88 + random() * 0.18)).toFixed(2),
      ),
      price: quote?.price ?? previousClose,
      previousClose,
      changePercent: quote?.changePercent ?? 0,
    };
  });
}
