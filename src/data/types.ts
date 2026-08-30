export interface IndexQuotation {
  id: string;
  name: string;
  symbol: string;
  level: number;
  change: number;
  changePercent: number;
}

export interface Quote {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  sectorId: string;
  isWatched: boolean;
}

export interface IntradayPricePoint {
  timestamp: string;
  price: number;
  volume: number;
  vwap: number;
}

export interface IntradaySeries {
  symbol: string;
  previousClose: number;
  points: IntradayPricePoint[];
}

export type SectorDirection = 'gaining' | 'losing';

export interface Sector {
  id: string;
  name: string;
  symbol: string;
  changePercent: number;
  direction: SectorDirection;
  netFlow: number;
}

export type RankingTabId = 'gainers' | 'active' | 'earnings' | 'news';

export interface RankingEntry {
  id: string;
  tabId: RankingTabId;
  symbol?: string;
  title: string;
  source?: string;
  price?: number;
  changePercent?: number;
  reason?: string;
  dateLabel?: string;
  time?: string;
  publishedAt?: string;
}

export interface NewsItem {
  id: string;
  tabId: string;
  title: string;
  source: string;
  publishedAt: string;
}

export interface EarningsAnnouncement {
  id: string;
  symbol: string;
  dateLabel: string;
  expectation: string;
}

export interface HoldingPosition {
  symbol: string;
  name: string;
  shares: number;
  costPerShare: number;
  price: number;
  previousClose: number;
  changePercent: number;
}

export interface SessionReadChip {
  id: string;
  label: string;
  variants: string[];
}

export interface SessionRead {
  id: string;
  title: string;
  generatedAt: string;
  chips: SessionReadChip[];
}

export type DirectionValue = 'up' | 'dn';
