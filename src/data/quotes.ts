import type { Quote } from './types';

interface BaseQuoteDefinition {
  symbol: string;
  name: string;
  previousClose: number;
  volume: number;
  sectorId: string;
  isWatched: boolean;
}

const BASE_QUOTES: BaseQuoteDefinition[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    previousClose: 227.4,
    volume: 52_000_000,
    sectorId: 'sec-tech',
    isWatched: true,
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    previousClose: 131.8,
    volume: 310_000_000,
    sectorId: 'sec-tech',
    isWatched: true,
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    previousClose: 428.6,
    volume: 24_000_000,
    sectorId: 'sec-tech',
    isWatched: true,
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    previousClose: 186.2,
    volume: 46_000_000,
    sectorId: 'sec-tech',
    isWatched: true,
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    previousClose: 168.9,
    volume: 29_000_000,
    sectorId: 'sec-tech',
    isWatched: true,
  },
  {
    symbol: 'META',
    name: 'Meta Platforms',
    previousClose: 552.3,
    volume: 19_000_000,
    sectorId: 'sec-tech',
    isWatched: true,
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    previousClose: 246.7,
    volume: 101_000_000,
    sectorId: 'sec-consumer',
    isWatched: true,
  },
  {
    symbol: 'AVGO',
    name: 'Broadcom Inc.',
    previousClose: 164.2,
    volume: 28_000_000,
    sectorId: 'sec-tech',
    isWatched: true,
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase',
    previousClose: 214.8,
    volume: 9_000_000,
    sectorId: 'sec-financials',
    isWatched: true,
  },
  {
    symbol: 'V',
    name: 'Visa Inc.',
    previousClose: 282.1,
    volume: 8_000_000,
    sectorId: 'sec-financials',
    isWatched: true,
  },
  {
    symbol: 'XOM',
    name: 'Exxon Mobil',
    previousClose: 118.4,
    volume: 17_000_000,
    sectorId: 'sec-energy',
    isWatched: false,
  },
  {
    symbol: 'UNH',
    name: 'UnitedHealth',
    previousClose: 542.6,
    volume: 4_000_000,
    sectorId: 'sec-health',
    isWatched: false,
  },
  {
    symbol: 'COST',
    name: 'Costco Wholesale',
    previousClose: 886.4,
    volume: 2_000_000,
    sectorId: 'sec-consumer-staples',
    isWatched: false,
  },
  {
    symbol: 'HD',
    name: 'Home Depot',
    previousClose: 368.2,
    volume: 4_000_000,
    sectorId: 'sec-industrials',
    isWatched: false,
  },
  {
    symbol: 'AMD',
    name: 'Adv. Micro Devices',
    previousClose: 148.7,
    volume: 62_000_000,
    sectorId: 'sec-tech',
    isWatched: false,
  },
  {
    symbol: 'NFLX',
    name: 'Netflix Inc.',
    previousClose: 682.3,
    volume: 5_000_000,
    sectorId: 'sec-tech',
    isWatched: false,
  },
  {
    symbol: 'PLTR',
    name: 'Palantir Tech',
    previousClose: 29.8,
    volume: 58_000_000,
    sectorId: 'sec-tech',
    isWatched: false,
  },
  {
    symbol: 'COIN',
    name: 'Coinbase Global',
    previousClose: 224.5,
    volume: 16_000_000,
    sectorId: 'sec-tech',
    isWatched: false,
  },
  {
    symbol: 'SMCI',
    name: 'Super Micro',
    previousClose: 46.2,
    volume: 21_000_000,
    sectorId: 'sec-tech',
    isWatched: false,
  },
  {
    symbol: 'MSTR',
    name: 'MicroStrategy',
    previousClose: 168.9,
    volume: 9_000_000,
    sectorId: 'sec-tech',
    isWatched: false,
  },
];

const LIVE_STATE = new Map<string, Quote>();

function initializeState(): void {
  BASE_QUOTES.forEach((definition, index) => {
    const randomFactor = 1 + (pseudoRandom(200 + index * 13)() - 0.46) * 0.05;
    const price = Number((definition.previousClose * randomFactor).toFixed(2));
    const change = Number((price - definition.previousClose).toFixed(2));
    LIVE_STATE.set(definition.symbol, {
      symbol: definition.symbol,
      name: definition.name,
      price,
      previousClose: definition.previousClose,
      change,
      changePercent: Number(
        ((price - definition.previousClose) / definition.previousClose) * 100,
      ),
      volume: definition.volume,
      sectorId: definition.sectorId,
      isWatched: definition.isWatched,
    });
  });
}

function pseudoRandom(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state * 1103515245 + 12345) & 2147483647;
    return state / 2147483647;
  };
}

export function getQuotes(): Quote[] {
  if (LIVE_STATE.size === 0) {
    initializeState();
  }
  LIVE_STATE.forEach((quote) => {
    const nextPrice = Number(
      (quote.price * (1 + (Math.random() - 0.5) * 0.0038)).toFixed(2),
    );
    quote.price = nextPrice;
    quote.change = Number((nextPrice - quote.previousClose).toFixed(2));
    quote.changePercent = Number(
      ((nextPrice - quote.previousClose) / quote.previousClose) * 100,
    );
  });
  return Array.from(LIVE_STATE.values());
}

export function getQuote(symbol: string): Quote | undefined {
  if (LIVE_STATE.size === 0) {
    initializeState();
  }
  return LIVE_STATE.get(symbol);
}

export function addSymbolToWatchlist(symbol: string): boolean {
  const quote = getQuote(symbol);
  if (!quote) {
    return false;
  }
  quote.isWatched = true;
  return true;
}

export function isSymbolInPool(symbol: string): boolean {
  return getQuote(symbol) !== undefined;
}

export function getWatchPoolQuoteCount(): number {
  return BASE_QUOTES.length;
}
