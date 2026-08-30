import { http, HttpResponse } from 'msw';
import { getIndexes } from '../data/indexes';
import { getQuotes, getQuote, addSymbolToWatchlist } from '../data/quotes';
import { getIntradaySeries } from '../data/intradaySeries';
import { getSectors } from '../data/sectors';
import {
  getNewsItems,
  getEarningsAnnouncements,
  getNewsStoryClocks,
} from '../data/newsItems';
import { buildSessionRead } from '../data/sessionRead';
import { getHoldings } from '../data/holdings';
import { formatCompact } from '../lib/format';
import type { RankingEntry } from '../data/types';

function relativeVolumeLabel(volume: number): string {
  const relativeMultiple = (1 + ((1 + Math.sin(20260816)) % 1) * 1.8).toFixed(
    1,
  );
  return `VOL ${formatCompact(volume)} · REL ${relativeMultiple}x`;
}

function buildRankingEntries(): RankingEntry[] {
  const quotes = getQuotes();
  const gainers = [...quotes]
    .sort((left, right) => right.changePercent - left.changePercent)
    .slice(0, 10);
  const gainerEntries: RankingEntry[] = gainers.map((quote) => ({
    id: `gainers-${quote.symbol}`,
    tabId: 'gainers',
    symbol: quote.symbol,
    title: quote.name,
    price: quote.price,
    changePercent: quote.changePercent,
    reason:
      quote.changePercent > 4
        ? 'Heavy call flow · IV rank 72'
        : 'Trend continuation, volume in line',
  }));

  const actives = [...quotes]
    .sort((left, right) => right.volume - left.volume)
    .slice(0, 10);
  const activeEntries: RankingEntry[] = actives.map((quote) => ({
    id: `active-${quote.symbol}`,
    tabId: 'active',
    symbol: quote.symbol,
    title: quote.name,
    price: quote.price,
    changePercent: quote.changePercent,
    reason: relativeVolumeLabel(quote.volume),
  }));

  const earningsEntries: RankingEntry[] = getEarningsAnnouncements().map(
    (announcement) => ({
      id: announcement.id,
      tabId: 'earnings',
      symbol: announcement.symbol,
      title: announcement.expectation,
      dateLabel: announcement.dateLabel,
      reason: announcement.expectation,
    }),
  );

  const storyClocks = getNewsStoryClocks();
  const newsEntries: RankingEntry[] = getNewsItems().map((item, index) => ({
    id: item.id,
    tabId: 'news',
    title: item.title,
    source: item.source,
    time: storyClocks[index] ?? '',
    publishedAt: item.publishedAt,
  }));

  return [
    ...gainerEntries,
    ...activeEntries,
    ...earningsEntries,
    ...newsEntries,
  ];
}

export const handlers = [
  http.get('/api/indexes', () => HttpResponse.json({ indexes: getIndexes() })),

  http.get('/api/quotes', () => HttpResponse.json({ quotes: getQuotes() })),

  http.get('/api/intraday', ({ request }) => {
    const url = new URL(request.url);
    const symbol = url.searchParams.get('symbol') ?? 'NVDA';
    return HttpResponse.json(getIntradaySeries(symbol));
  }),

  http.get('/api/sectors', () => HttpResponse.json({ sectors: getSectors() })),

  http.get('/api/news', ({ request }) => {
    const url = new URL(request.url);
    const tab = url.searchParams.get('tab') ?? 'news';
    return HttpResponse.json({
      tab,
      items: buildRankingEntries().filter((entry) => entry.tabId === tab),
    });
  }),

  http.get('/api/session-read', () => HttpResponse.json(buildSessionRead())),

  http.get('/api/holdings', () =>
    HttpResponse.json({ holdings: getHoldings() }),
  ),

  http.post('/api/watchlist/:symbol', ({ params }) => {
    const symbol = String(params.symbol);
    if (addSymbolToWatchlist(symbol)) {
      return HttpResponse.json({ symbol, added: true });
    }
    return HttpResponse.json({ symbol, added: false }, { status: 404 });
  }),

  http.get('/api/quote/:symbol', ({ params }) => {
    const symbol = String(params.symbol);
    const quote = getQuote(symbol);
    if (!quote) {
      return HttpResponse.json({ detail: 'not-found' }, { status: 404 });
    }
    return HttpResponse.json({ quote });
  }),
];
