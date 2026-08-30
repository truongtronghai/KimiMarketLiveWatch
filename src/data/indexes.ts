import type { IndexQuotation } from './types';

const BASE_INDEXES: Array<
  Omit<IndexQuotation, 'change' | 'changePercent'> & { changePercent: number }
> = [
  {
    id: 'idx-spx',
    name: 'S&P 500',
    symbol: 'SPX',
    level: 5634.2,
    changePercent: 0.42,
  },
  {
    id: 'idx-ndx',
    name: 'Nasdaq 100',
    symbol: 'NDX',
    level: 19648.7,
    changePercent: 0.87,
  },
  {
    id: 'idx-dji',
    name: 'Dow Jones',
    symbol: 'DJI',
    level: 41286.4,
    changePercent: 0.13,
  },
];

function buildIndexLevel(level: number, changePercent: number): number {
  return Number((level / (1 + changePercent / 100)).toFixed(3));
}

export function getIndexes(): IndexQuotation[] {
  return BASE_INDEXES.map((baseEntry) => {
    const previousClose = buildIndexLevel(
      baseEntry.level,
      baseEntry.changePercent,
    );
    const change = Number((baseEntry.level - previousClose).toFixed(2));
    return {
      id: baseEntry.id,
      name: baseEntry.name,
      symbol: baseEntry.symbol,
      level: baseEntry.level,
      change,
      changePercent: baseEntry.changePercent,
    };
  });
}
