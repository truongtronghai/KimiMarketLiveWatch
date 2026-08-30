import { describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { WatchlistPanel } from '../../src/components/watchlist/WatchlistPanel';
import type { HoldingPosition, Quote } from '../../src/data/types';

const QUOTES: Quote[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 227.4,
    previousClose: 226.2,
    change: 1.2,
    changePercent: 0.53,
    volume: 42_100_000,
    sectorId: 'tech',
    isWatched: true,
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    price: 131.8,
    previousClose: 130.6,
    change: 1.2,
    changePercent: 0.92,
    volume: 189_500_000,
    sectorId: 'tech',
    isWatched: true,
  },
  {
    symbol: 'GDX',
    name: 'VanEck Gold Miners',
    price: 38.2,
    previousClose: 38.9,
    change: -0.7,
    changePercent: -1.8,
    volume: 9_400_000,
    sectorId: 'materials',
    isWatched: false,
  },
];

const HOLDINGS: HoldingPosition[] = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    shares: 120,
    costPerShare: 105.2,
    price: 131.8,
    previousClose: 130.6,
    changePercent: 0.92,
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 180,
    costPerShare: 201.4,
    price: 227.4,
    previousClose: 226.2,
    changePercent: 0.53,
  },
];

describe('WatchlistPanel', () => {
  it('lists only watched symbols with price and signed change', () => {
    render(<WatchlistPanel quotes={QUOTES} holdings={HOLDINGS} />);

    const rows = screen.getAllByTestId('watchlist-row');
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain('AAPL');
    expect(rows[0].textContent).toContain('227.40');
    expect(rows[0].textContent).toContain('+0.53%');
    expect(rows[1].textContent).toContain('NVDA');
    expect(screen.queryByText('GDX')).not.toBeInTheDocument();
  });

  it('marks the selected row and reports a row click', () => {
    const onSelectQuote = vi.fn();
    render(
      <WatchlistPanel
        quotes={QUOTES}
        holdings={HOLDINGS}
        selectedSymbol="NVDA"
        onSelectQuote={onSelectQuote}
      />,
    );

    const rows = screen.getAllByTestId('watchlist-row');
    expect(rows[0].className).not.toContain('on');
    expect(rows[1].className).toContain('on');

    fireEvent.click(rows[0]);
    expect(onSelectQuote).toHaveBeenCalledWith('AAPL');
  });

  it('adds a known symbol via the search box', () => {
    const onAddSymbol = vi.fn(() => true);
    render(
      <WatchlistPanel
        quotes={QUOTES}
        holdings={HOLDINGS}
        onAddSymbol={onAddSymbol}
      />,
    );

    const input = screen.getByTestId('watchlist-search-input');
    fireEvent.change(input, { target: { value: 'gd' } });
    fireEvent.submit(screen.getByTestId('watchlist-search'));

    expect(onAddSymbol).toHaveBeenCalledWith('GD');
    expect(input).toHaveValue('');
  });

  it('warns when the added symbol is not in the pool', () => {
    const onAddSymbol = vi.fn(() => false);
    render(
      <WatchlistPanel
        quotes={QUOTES}
        holdings={HOLDINGS}
        onAddSymbol={onAddSymbol}
      />,
    );

    const input = screen.getByTestId('watchlist-search-input');
    fireEvent.change(input, { target: { value: 'zzzz' } });
    fireEvent.submit(screen.getByTestId('watchlist-search'));

    expect(onAddSymbol).toHaveBeenCalledWith('ZZZZ');
    expect(screen.getByTestId('watchlist-warn')).toBeInTheDocument();
  });

  it('shows the tracked count footer', () => {
    render(<WatchlistPanel quotes={QUOTES} holdings={HOLDINGS} />);
    expect(screen.getByTestId('watchlist-count')).toHaveTextContent(
      '2/3 tracked',
    );
  });

  it('flashes a row when a price changes between renders', () => {
    const { rerender } = render(
      <WatchlistPanel quotes={QUOTES} holdings={HOLDINGS} />,
    );

    const changedQuotes = QUOTES.map((quote) =>
      quote.symbol === 'AAPL' ? { ...quote, price: 228.1 } : quote,
    );
    rerender(<WatchlistPanel quotes={changedQuotes} holdings={HOLDINGS} />);

    const aaplPrice = screen.getByTestId('watch-price-AAPL');
    expect(aaplPrice.className).toContain('flash-up');
    expect(aaplPrice.textContent).toBe('228.10');
  });

  it('shows a portfolio view matching the original #pview structure', () => {
    const { container } = render(
      <WatchlistPanel quotes={QUOTES} holdings={HOLDINGS} />,
    );

    const pview = container.querySelector('#pview');
    expect(pview).not.toBeNull();
    expect(pview?.hasAttribute('hidden')).toBe(true);

    fireEvent.click(screen.getByTestId('portfolio-tab'));

    const summary = screen.getByTestId('portfolio-view');
    expect(summary.id).toBe('pview');
    expect(summary.hasAttribute('hidden')).toBe(false);

    expect(container.querySelector('#p-total')).not.toBeNull();
    expect(container.querySelector('#p-day')).not.toBeNull();
    expect(container.querySelector('#p-pnl')).not.toBeNull();
    expect(container.querySelector('#p-spark')).not.toBeNull();

    expect(summary.textContent).toContain('Market value');
    expect(summary.textContent).toContain('$56,748');
    expect(summary.textContent).toContain('$360');
    expect(summary.textContent).toContain('Day P&L');
    expect(summary.textContent).toContain('Total return');
    expect(summary.textContent).toContain('$7,872');
    expect(screen.getByTestId('portfolio-sparkline')).toBeInTheDocument();

    const rowContainer = summary.querySelector('#prows');
    expect(rowContainer).not.toBeNull();
    const rows = screen.getAllByTestId('portfolio-row');
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain('NVDA');
    expect(rows[0].textContent).toContain('120 sh');
    expect(rows[0].textContent).toContain('avg 105.20');
    expect(rows[0].textContent).toContain('last 131.80');
    expect(rows[0].textContent).toContain('+25.3%');
    expect(rows[0].textContent).toContain('+$3,192');
  });

  it('clears the price flash after the animation window', () => {
    vi.useFakeTimers();
    try {
      const { rerender } = render(
        <WatchlistPanel quotes={QUOTES} holdings={HOLDINGS} />,
      );

      const changedQuotes = QUOTES.map((quote) =>
        quote.symbol === 'AAPL' ? { ...quote, price: 228.1 } : quote,
      );
      rerender(<WatchlistPanel quotes={changedQuotes} holdings={HOLDINGS} />);

      expect(screen.getByTestId('watch-price-AAPL').className).toContain(
        'flash-up',
      );

      act(() => {
        vi.advanceTimersByTime(700);
      });
      expect(screen.getByTestId('watch-price-AAPL').className).not.toContain(
        'flash-up',
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
