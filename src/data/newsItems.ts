import type { EarningsAnnouncement, NewsItem } from './types';

export const NEWS_TAB_DEFINITIONS = [
  { id: 'gainers', label: 'Gainers' },
  { id: 'active', label: 'Active' },
  { id: 'earnings', label: 'Earnings' },
  { id: 'news', label: 'News' },
] as const;

const NEWS_STORIES: Array<[string, string, string, string]> = [
  [
    '12:58',
    'Wire',
    'NVDA pares gains after touching new 52-week high; SOXX still +3.1%',
    'Macro',
  ],
  [
    '12:31',
    'Fed',
    'Powell: policy path "data-dependent", no rush to ease before inflation durably cools',
    'Fed',
  ],
  [
    '11:47',
    'Macro',
    'July CPI +0.2% m/m, in line; core +3.1% y/y, lightest since 2021',
    'Macro',
  ],
  [
    '11:02',
    'Options',
    'Unusual call activity: 48k NVDA Aug-30 135C changed hands by midday',
    'Flow',
  ],
  [
    '10:26',
    'Earnings',
    'AVGO guides Q4 revenue above consensus on hyperscaler capex',
    'Earn',
  ],
  [
    '09:52',
    'Sector',
    'Financials quietly at 52-week highs: JPM, V lead XLF to best week since March',
    'Sector',
  ],
  [
    '09:30',
    'Wire',
    'Stocks open mixed; mega-cap tech lifts NDX while equal-weight SPX lags',
    'Open',
  ],
  [
    '08:44',
    'Macro',
    '10Y yield steady at 4.21%; dollar index slips for a third session',
    'Macro',
  ],
  [
    '08:12',
    'Earnings',
    'COST same-store sales +6.8% ex-gas; e-commerce comps +18%',
    'Earn',
  ],
  [
    '07:30',
    'Premarket',
    'Semis bid premarket after TSMC monthly revenue beat; MU, AMD +2%',
    'Pre',
  ],
];

const EARNINGS_ANNOUNCEMENTS: Array<[string, string, string]> = [
  ['NVDA', 'Aug 27 · AMC', 'EPS est 0.64 · whisper 0.71'],
  ['MSFT', 'Oct 22 · AMC', 'EPS est 3.10'],
  ['JPM', 'Oct 11 · BMO', 'EPS est 4.02'],
  ['TSLA', 'Oct 16 · AMC', 'EPS est 0.58 · whisper 0.66'],
  ['NFLX', 'Oct 17 · AMC', 'EPS est 5.12'],
  ['AMD', 'Oct 29 · AMC', 'EPS est 0.92'],
];

function storyTimeToIso(clockLabel: string): string {
  const [hour, minute] = clockLabel.split(':').map(Number);
  return `2026-08-30T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00Z`;
}

export function getNewsItems(): NewsItem[] {
  return NEWS_STORIES.map(([clockLabel, source, title], index) => ({
    id: `story-${index + 1}`,
    tabId: 'news',
    title,
    source,
    publishedAt: storyTimeToIso(clockLabel),
  }));
}

export function getNewsStoryClocks(): string[] {
  return NEWS_STORIES.map(([clockLabel]) => clockLabel);
}

export function getEarningsAnnouncements(): EarningsAnnouncement[] {
  return EARNINGS_ANNOUNCEMENTS.map(
    ([symbol, dateLabel, expectation], index) => ({
      id: `earnings-${index + 1}`,
      symbol,
      dateLabel,
      expectation,
    }),
  );
}
