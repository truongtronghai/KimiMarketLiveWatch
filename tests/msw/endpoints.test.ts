import { describe, expect, it } from 'vitest';
import type {
  HoldingPosition,
  IntradaySeries,
  Quote,
  IndexQuotation,
  RankingEntry,
  Sector,
  SessionRead,
} from '../../src/data/types';

interface ApiSuccess<T> {
  data: T;
  status: number;
}

async function getJson<T>(url: string): Promise<ApiSuccess<T>> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GET ${url} -> ${response.status}`);
  }
  const data = (await response.json()) as T;
  return { data, status: response.status };
}

function assertQuote(quote: Quote): void {
  expect(typeof quote.symbol).toBe('string');
  expect(typeof quote.price).toBe('number');
  expect(typeof quote.changePercent).toBe('number');
  expect(quote.previousClose).toBeGreaterThan(0);
  expect(typeof quote.isWatched).toBe('boolean');
  expect(typeof quote.volume).toBe('number');
}

describe('MSW wire contract', () => {
  it('serves three broad market indexes', async () => {
    const { data } = await getJson<{ indexes: IndexQuotation[] }>(
      '/api/indexes',
    );
    expect(data.indexes.length).toBeGreaterThanOrEqual(3);
    expect(data.indexes.map((item) => item.symbol)).toEqual(
      expect.arrayContaining(['SPX', 'NDX', 'DJI']),
    );
    data.indexes.forEach((entry) => {
      expect(typeof entry.level).toBe('number');
      expect(typeof entry.changePercent).toBe('number');
    });
  });

  it('serves a quote pool with at least one watched symbol', async () => {
    const { data } = await getJson<{ quotes: Quote[] }>('/api/quotes');
    expect(data.quotes.length).toBeGreaterThanOrEqual(20);
    data.quotes.forEach(assertQuote);
    expect(data.quotes.some((quote) => quote.isWatched)).toBe(true);
    const nvda = data.quotes.find((quote) => quote.symbol === 'NVDA');
    expect(nvda?.price ?? 0).toBeGreaterThan(0);
  });

  it('serves a populated intraday session for a known symbol', async () => {
    const { data } = await getJson<IntradaySeries>('/api/intraday?symbol=NVDA');
    expect(data.symbol).toBe('NVDA');
    expect(data.points.length).toBeGreaterThan(0);
    const latest = data.points[data.points.length - 1];
    expect(typeof latest.timestamp).toBe('string');
    expect(latest.price).toBeGreaterThan(0);
    expect(latest.volume).toBeGreaterThan(0);
    expect(latest.vwap).toBeGreaterThan(0);
  });

  it('serves twelve GICS sectors with magnitude ordering', async () => {
    const { data } = await getJson<{ sectors: Sector[] }>('/api/sectors');
    expect(data.sectors).toHaveLength(12);
    const magnitudes = data.sectors.map((sector) =>
      Math.abs(sector.changePercent),
    );
    expect(magnitudes).toEqual(
      [...magnitudes].sort((left, right) => right - left),
    );
    data.sectors.forEach((sector) => {
      expect(['gaining', 'losing']).toContain(sector.direction);
      expect(typeof sector.netFlow).toBe('number');
    });
  });

  it('serves ranking entries per tab in descending order', async () => {
    const { data: gainers } = await getJson<{
      tab: string;
      items: RankingEntry[];
    }>('/api/news?tab=gainers');
    expect(gainers.items.length).toBeGreaterThan(0);
    gainers.items.forEach((entry) => expect(entry.tabId).toBe('gainers'));
    const pctValues = gainers.items.map((entry) => entry.changePercent ?? 0);
    expect(pctValues).toEqual(
      [...pctValues].sort((left, right) => right - left),
    );

    const { data: news } = await getJson<{
      tab: string;
      items: RankingEntry[];
    }>('/api/news?tab=news');
    expect(news.items.length).toBeGreaterThan(0);
    news.items.forEach((entry) => {
      expect(entry.title.length).toBeGreaterThan(0);
      expect(typeof entry.source).toBe('string');
      expect(entry.publishedAt).toBeDefined();
    });
  });

  it('serves a session read with three analysis chips', async () => {
    const { data } = await getJson<SessionRead>('/api/session-read');
    expect(data.chips).toHaveLength(3);
    expect(data.chips.map((chip) => chip.label)).toEqual([
      'Market Brief',
      'Sector Read',
      'Risk Notes',
    ]);
    data.chips.forEach((chip) =>
      expect(chip.variants.length).toBeGreaterThanOrEqual(1),
    );
  });

  it('serves holdings enriched with live prices', async () => {
    const { data } = await getJson<{ holdings: HoldingPosition[] }>(
      '/api/holdings',
    );
    expect(data.holdings).toHaveLength(5);
    data.holdings.forEach((position) => {
      expect(position.shares).toBeGreaterThan(0);
      expect(position.price).toBeGreaterThan(0);
      expect(position.costPerShare).toBeGreaterThan(0);
      expect(position.changePercent).toBeGreaterThan(-100);
    });
  });

  it('adds a symbol to the watch pool idempotently and rejects unknown symbols', async () => {
    const added = await fetch('/api/watchlist/COIN', { method: 'POST' });
    expect(added.status).toBe(200);
    const { added: addedFlag } = (await added.json()) as { added: boolean };
    expect(addedFlag).toBe(true);

    const { data } = await getJson<{ quotes: Quote[] }>('/api/quotes');
    const coin = data.quotes.find((quote) => quote.symbol === 'COIN');
    expect(coin?.isWatched).toBe(true);

    const again = await fetch('/api/watchlist/COIN', { method: 'POST' });
    expect(again.status).toBe(200);

    const unknown = await fetch('/api/watchlist/TICKER-UNKNOWN', {
      method: 'POST',
    });
    expect(unknown.status).toBe(404);
  });

  it('returns a quote for a pool symbol', async () => {
    const response = await fetch('/api/quote/NVDA');
    expect(response.status).toBe(200);
    const { quote } = (await response.json()) as { quote: Quote };
    assertQuote(quote);

    const missing = await fetch('/api/quote/TICKER-UNKNOWN');
    expect(missing.status).toBe(404);
  });
});
