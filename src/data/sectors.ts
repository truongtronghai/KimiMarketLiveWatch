import type { Sector } from './types';

const BASE_SECTORS: Array<Omit<Sector, 'direction' | 'netFlow'>> = [
  { id: 'sec-tech', name: 'Tech', symbol: 'XLK', changePercent: 2.14 },
  { id: 'sec-comm', name: 'Comm Svcs', symbol: 'XLC', changePercent: 1.42 },
  { id: 'sec-fin', name: 'Financials', symbol: 'XLF', changePercent: 0.68 },
  { id: 'sec-consumer', name: 'Cons Disc', symbol: 'XLY', changePercent: 0.92 },
  {
    id: 'sec-staples',
    name: 'Cons Staples',
    symbol: 'XLP',
    changePercent: -0.34,
  },
  { id: 'sec-energy', name: 'Energy', symbol: 'XLE', changePercent: -1.26 },
  { id: 'sec-health', name: 'Health Care', symbol: 'XLV', changePercent: 0.45 },
  {
    id: 'sec-industrials',
    name: 'Industrials',
    symbol: 'XLI',
    changePercent: 0.12,
  },
  {
    id: 'sec-materials',
    name: 'Materials',
    symbol: 'XLB',
    changePercent: -0.58,
  },
  {
    id: 'sec-realestate',
    name: 'Real Estate',
    symbol: 'XLRE',
    changePercent: -0.87,
  },
  {
    id: 'sec-utilities',
    name: 'Utilities',
    symbol: 'XLU',
    changePercent: 0.31,
  },
  { id: 'sec-semis', name: 'Semis', symbol: 'SOXX', changePercent: 3.08 },
];

export function getSectors(): Sector[] {
  return BASE_SECTORS.map((sector) => ({
    ...sector,
    direction:
      sector.changePercent >= 0 ? ('gaining' as const) : ('losing' as const),
    netFlow: Math.round(Math.abs(sector.changePercent) * 1_000_000),
  })).sort(
    (left, right) =>
      Math.abs(right.changePercent) - Math.abs(left.changePercent),
  );
}
