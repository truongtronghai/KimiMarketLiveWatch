import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { HoldingPosition, Quote } from '../../data/types';
import {
  directionClass,
  formatCurrencyRounded,
  formatPrice,
  formatSignedCurrencyRounded,
  formatSignedPercent,
} from '../../lib/format';

interface WatchlistPanelProps {
  quotes: Quote[];
  holdings: HoldingPosition[];
  selectedSymbol?: string;
  isError?: boolean;
  isLoading?: boolean;
  onSelectQuote?: (symbol: string) => void;
  onAddSymbol?: (symbol: string) => boolean | undefined;
}

interface FlashState {
  symbol: string;
  direction: 'up' | 'down';
}

const SPARK_LINE_LENGTH = 60;
const ACTIVE_FLASH_TIMEOUT_MS = 650;

function buildSparkLine(seed: number): number[] {
  let value = 0;
  const points: number[] = [];
  for (let index = 0; index < SPARK_LINE_LENGTH; index += 1) {
    // 53-bit PRNG seeded by position so the line is stable per position.
    const noise =
      (((Math.sin(seed + index * 12.9898) * 43758.5453) % 1) + 1) % 1;
    value += (noise - 0.5) * 2;
    points.push(+value.toFixed(3));
  }
  return points;
}

interface SparkLineProps {
  direction: 'up' | 'down';
  ariaLabel: string;
  id?: string;
}

function SparkLine({ direction, ariaLabel, id }: SparkLineProps) {
  const { linePath, areaPath, zeroY } = useMemo(() => {
    const sparkPoints = buildSparkLine(7);
    const minValue = Math.min(...sparkPoints);
    const maxValue = Math.max(...sparkPoints);
    const range = maxValue - minValue || 1;
    const width = 240;
    const height = 44;
    const step = width / (sparkPoints.length - 1);
    const mapY = (value: number): number =>
      height - ((value - minValue) / range) * (height - 8) - 4;
    const coords = sparkPoints.map(
      (point, index) =>
        `${(index * step).toFixed(1)},${mapY(point).toFixed(1)}`,
    );
    return {
      linePath: `M${coords.join(' L')}`,
      areaPath: `M${coords[0]} L${coords.slice(1).join(' L')} L240,44 L0,44 Z`,
      zeroY: mapY(0),
    };
  }, []);

  const color = direction === 'up' ? 'var(--pos)' : 'var(--neg)';

  return (
    <svg
      className="spark"
      id={id}
      viewBox="0 0 240 44"
      preserveAspectRatio="none"
      style={{ color }}
      aria-label={ariaLabel}
      data-testid="portfolio-sparkline"
    >
      <path d={areaPath} fill="currentColor" opacity="0.12" stroke="none" />
      <line
        x1="0"
        y1={zeroY}
        x2={240}
        y2={zeroY}
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeDasharray="2 3"
        strokeWidth="1"
      />
      <path d={linePath} fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function usePriceFlash(quotes: Quote[]): FlashState[] {
  const [flashes, setFlashes] = useState<FlashState[]>([]);
  const previousPricesRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const previous = previousPricesRef.current;
    const activeFlashes: FlashState[] = [];
    quotes.forEach((quote) => {
      const priorPrice = previous.get(quote.symbol);
      if (priorPrice !== undefined && priorPrice !== quote.price) {
        activeFlashes.push({
          symbol: quote.symbol,
          direction: quote.price > priorPrice ? 'up' : 'down',
        });
      }
      previous.set(quote.symbol, quote.price);
    });
    if (activeFlashes.length > 0) {
      setFlashes(activeFlashes);
      const timeoutId = window.setTimeout(
        () => setFlashes([]),
        ACTIVE_FLASH_TIMEOUT_MS,
      );
      return () => window.clearTimeout(timeoutId);
    }
    setFlashes((current) => (current.length > 0 ? current : []));
    return undefined;
  }, [quotes]);

  return flashes;
}

export function WatchlistPanel({
  quotes,
  holdings,
  selectedSymbol,
  isError,
  isLoading,
  onSelectQuote,
  onAddSymbol,
}: WatchlistPanelProps) {
  const [activeTab, setActiveTab] = useState<'watch' | 'hold'>('watch');
  const [query, setQuery] = useState('');
  const [invalidQuery, setInvalidQuery] = useState(false);
  const flashes = usePriceFlash(quotes);
  const watchedQuotes = useMemo(
    () => quotes.filter((quote) => quote.isWatched),
    [quotes],
  );

  const handleAddSymbol = (event: FormEvent): void => {
    event.preventDefault();
    const symbol = query.trim().toUpperCase();
    if (!symbol) {
      return;
    }
    const added = onAddSymbol?.(symbol) ?? false;
    if (!added) {
      setInvalidQuery(true);
      window.setTimeout(() => setInvalidQuery(false), 1500);
      return;
    }
    setQuery('');
  };

  const portfolioSummary = useMemo(() => {
    const marketValue = holdings.reduce(
      (sum, holding) => sum + holding.price * holding.shares,
      0,
    );
    const dayPnl = holdings.reduce(
      (sum, holding) =>
        sum + (holding.price - holding.previousClose) * holding.shares,
      0,
    );
    const costBasis = holdings.reduce(
      (sum, holding) => sum + holding.costPerShare * holding.shares,
      0,
    );
    const totalReturn = marketValue - costBasis;
    const openingValue = marketValue - dayPnl;
    const dayPnlPercent = openingValue > 0 ? (dayPnl / openingValue) * 100 : 0;
    const totalReturnPercent =
      costBasis > 0 ? (totalReturn / costBasis) * 100 : 0;
    return {
      marketValue,
      dayPnl,
      totalReturn,
      totalReturnPercent,
      dayPnlPercent,
    };
  }, [holdings]);

  const holdingCount = holdings.length;
  const watchedCount = watchedQuotes.length;
  const totalCount = quotes.length;

  return (
    <section className="col l" data-testid="watchlist-panel">
      <div className="wtabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'watch'}
          className={activeTab === 'watch' ? 'on' : undefined}
          onClick={() => setActiveTab('watch')}
          data-testid="watch-tab"
        >
          Watchlist
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'hold'}
          className={activeTab === 'hold' ? 'on' : undefined}
          onClick={() => setActiveTab('hold')}
          data-testid="portfolio-tab"
        >
          Portfolio
        </button>
      </div>

      <form
        className="wsearch"
        hidden={activeTab !== 'watch'}
        onSubmit={handleAddSymbol}
        data-testid="watchlist-search"
      >
        <span className="go">ADD SYMBOL</span>
        <input
          type="text"
          maxLength={6}
          placeholder="abc"
          value={query}
          data-testid="watchlist-search-input"
          onChange={(event) => setQuery(event.target.value)}
        />
      </form>
      <div
        className="wlist"
        hidden={activeTab !== 'watch'}
        data-testid="watchlist-list"
      >
        {isLoading && watchedQuotes.length === 0 ? (
          <div className="status-line" data-testid="watchlist-status">
            Loading watchlist…
          </div>
        ) : isError && watchedQuotes.length === 0 ? (
          <div className="empty" data-testid="watchlist-empty">
            Unable to load watchlist
          </div>
        ) : watchedQuotes.length === 0 ? (
          <div className="empty" data-testid="watchlist-empty">
            No symbols watched yet — add one above
          </div>
        ) : (
          watchedQuotes.map((quote) => {
            const flash = flashes.find((item) => item.symbol === quote.symbol);
            const flashClass = flash ? `flash-${flash.direction}` : '';
            const isSelected = quote.symbol === selectedSymbol;
            return (
              <div
                className={`wrow${isSelected ? ' on' : ''}`}
                key={quote.symbol}
                data-testid="watchlist-row"
                data-e2e={`L${quote.symbol}`}
                onClick={() => onSelectQuote?.(quote.symbol)}
              >
                <span className="nm">{quote.symbol}</span>
                <span className="full">{quote.name}</span>
                <span
                  className={`pv ${flashClass}`}
                  data-testid={`watch-price-${quote.symbol}`}
                >
                  {formatPrice(quote.price)}
                </span>
                <span className={`pc ${directionClass(quote.changePercent)}`}>
                  {formatSignedPercent(quote.changePercent)}
                </span>
              </div>
            );
          })
        )}
      </div>
      {activeTab === 'watch' && invalidQuery && (
        <div className="search-warn" data-testid="watchlist-warn">
          Unknown symbol — try a ticker from the pool
        </div>
      )}
      <div
        className="cnt"
        hidden={activeTab !== 'watch'}
        data-testid="watchlist-count"
      >
        {watchedCount}/{totalCount} tracked
      </div>

      <div
        className="pview"
        id="pview"
        hidden={activeTab !== 'hold'}
        data-testid="portfolio-view"
      >
        <div className="psum">
          <div className="t">
            <span>Market value</span>
            <b id="p-total">
              {formatCurrencyRounded(portfolioSummary.marketValue)}
            </b>
          </div>
          <div className="t">
            <span>Day P&L</span>
            <b
              id="p-day"
              className={portfolioSummary.dayPnl >= 0 ? 'up' : 'dn'}
            >
              {formatSignedCurrencyRounded(portfolioSummary.dayPnl)}
              <small>{portfolioSummary.dayPnlPercent.toFixed(2)}%</small>
            </b>
          </div>
          <div className="t">
            <span>Total return</span>
            <b
              id="p-pnl"
              className={portfolioSummary.totalReturn >= 0 ? 'up' : 'dn'}
            >
              {formatSignedCurrencyRounded(portfolioSummary.totalReturn)}
              <small>{portfolioSummary.totalReturnPercent.toFixed(1)}%</small>
            </b>
          </div>
          <SparkLine
            direction={portfolioSummary.totalReturn >= 0 ? 'up' : 'down'}
            id="p-spark"
            ariaLabel="Portfolio return"
          />
        </div>
        <div id="prows" data-testid="portfolio-list">
          {isLoading && holdingCount === 0 ? (
            <div className="status-line" data-testid="portfolio-status">
              Loading portfolio…
            </div>
          ) : isError && holdingCount === 0 ? (
            <div className="empty" data-testid="portfolio-empty">
              Unable to load portfolio
            </div>
          ) : holdingCount === 0 ? (
            <div className="empty" data-testid="portfolio-empty">
              No positions held yet
            </div>
          ) : (
            holdings.map((holding) => {
              const positionPnl =
                (holding.price - holding.costPerShare) * holding.shares;
              const positionReturnPercent =
                holding.costPerShare > 0
                  ? ((holding.price - holding.costPerShare) /
                      holding.costPerShare) *
                    100
                  : 0;
              const isSelected = holding.symbol === selectedSymbol;
              return (
                <div
                  className={`prow${isSelected ? ' on' : ''}`}
                  key={holding.symbol}
                  data-testid="portfolio-row"
                  onClick={() => onSelectQuote?.(holding.symbol)}
                >
                  <span className="nm">{holding.symbol}</span>
                  <span className="sub">
                    {holding.shares} sh · avg {holding.costPerShare.toFixed(2)}{' '}
                    · last {holding.price.toFixed(2)} ·{' '}
                    {positionReturnPercent >= 0 ? '+' : ''}
                    {positionReturnPercent.toFixed(1)}%
                  </span>
                  <span className={`pnl ${positionPnl >= 0 ? 'up' : 'dn'}`}>
                    {formatSignedCurrencyRounded(positionPnl)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
