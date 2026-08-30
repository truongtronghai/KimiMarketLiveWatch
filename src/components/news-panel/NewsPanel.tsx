import { Fragment } from 'react';
import type { RankingEntry, RankingTabId } from '../../data/types';
import { NEWS_TAB_DEFINITIONS } from '../../data/newsItems';
import { formatPrice, formatSignedPercent } from '../../lib/format';

const KNOWN_TICKERS = new Set([
  'AAPL',
  'NVDA',
  'MSFT',
  'AMZN',
  'GOOGL',
  'META',
  'TSLA',
  'AVGO',
  'JPM',
  'V',
  'XOM',
  'UNH',
  'COST',
  'HD',
  'AMD',
  'NFLX',
  'PLTR',
  'COIN',
  'SMCI',
  'MSTR',
  'SOXX',
  'XLK',
  'XLC',
  'XLF',
  'XLY',
  'XLP',
  'XLE',
  'XLV',
  'XLI',
  'XLB',
  'XLRE',
  'XLU',
]);

interface NewsPanelProps {
  activeTab: RankingTabId;
  items: RankingEntry[];
  isError?: boolean;
  isLoading?: boolean;
  onSelectTab?: (tab: RankingTabId) => void;
  onSelectQuote?: (symbol: string) => void;
  onNotifyDemo?: (message: string) => void;
}

function highlightTickers(
  headline: string,
): Array<{ text: string; isTicker: boolean }> {
  const tokens = headline.split(/(\b[A-Z]{2,5}\b)/g).filter(Boolean);
  return tokens.map((token) => ({
    text: token,
    isTicker: KNOWN_TICKERS.has(token),
  }));
}

function renderQuoteRow(
  entry: RankingEntry,
  onSelectQuote?: (symbol: string) => void,
) {
  return (
    <div
      className="mrow"
      key={entry.id}
      data-testid="ranking-row"
      onClick={() => entry.symbol && onSelectQuote?.(entry.symbol)}
    >
      <span className="nm">{entry.symbol}</span>
      <span className="pv">
        {entry.price != null ? formatPrice(entry.price) : ''}
      </span>
      <span
        className={`pc ${entry.changePercent != null && entry.changePercent >= 0 ? 'up' : 'dn'}`}
      >
        {entry.changePercent != null
          ? formatSignedPercent(entry.changePercent)
          : ''}
      </span>
      <span className="why">{entry.reason}</span>
    </div>
  );
}

function renderEarningsRow(
  entry: RankingEntry,
  onSelectQuote?: (symbol: string) => void,
) {
  return (
    <div
      className="mrow"
      key={entry.id}
      data-testid="ranking-row"
      onClick={() => entry.symbol && onSelectQuote?.(entry.symbol)}
    >
      <span className="nm">{entry.symbol}</span>
      <span
        className="pv"
        style={{ fontSize: '10.5px', color: 'var(--muted)' }}
      >
        {entry.dateLabel}
      </span>
      <span className="pc" style={{ color: 'var(--accent)' }}>
        ▸
      </span>
      <span className="why">{entry.reason}</span>
    </div>
  );
}

function renderNewsRow(
  entry: RankingEntry,
  onNotifyDemo?: (message: string) => void,
) {
  const highlightedTokens = highlightTickers(entry.title);
  return (
    <div
      className="nrow"
      key={entry.id}
      data-testid="news-row"
      onClick={() => onNotifyDemo?.('Story view is a demo placeholder')}
    >
      <span className="tm">{entry.time ? `${entry.time} ET` : ''}</span>
      <span className="src">{entry.source}</span>
      <span className="hl">
        {highlightedTokens.map((token, index) =>
          token.isTicker ? (
            <b key={`${entry.id}-${index}`}>{token.text}</b>
          ) : (
            <Fragment key={`${entry.id}-${index}`}>{token.text}</Fragment>
          ),
        )}
      </span>
    </div>
  );
}

export function NewsPanel({
  activeTab,
  items,
  isError,
  isLoading,
  onSelectTab,
  onSelectQuote,
  onNotifyDemo,
}: NewsPanelProps) {
  return (
    <Fragment>
      <div className="rtabs" role="tablist" data-testid="news-tabs">
        {NEWS_TAB_DEFINITIONS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            data-v={tab.id}
            className={activeTab === tab.id ? 'on' : undefined}
            onClick={() => onSelectTab?.(tab.id)}
            data-testid={`news-tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="rlist" role="tabpanel" data-testid="news-list">
        {isLoading && items.length === 0 ? (
          <div className="status-line" data-testid="news-status">
            Loading…
          </div>
        ) : isError ? (
          <div className="empty" data-testid="news-empty">
            Unable to load stories
          </div>
        ) : items.length === 0 ? (
          <div className="empty" data-testid="news-empty">
            No stories for this tab yet
          </div>
        ) : (
          items.map((entry) => {
            if (activeTab === 'news') {
              return renderNewsRow(entry, onNotifyDemo);
            }
            if (activeTab === 'earnings') {
              return renderEarningsRow(entry, onSelectQuote);
            }
            return renderQuoteRow(entry, onSelectQuote);
          })
        )}
      </div>
    </Fragment>
  );
}
