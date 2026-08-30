import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuoteTape } from '../../src/components/quote-tape/QuoteTape';
import type { Quote } from '../../src/data/types';

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
];

describe('QuoteTape', () => {
  it('renders a doubled moving lane with symbol, price and change percent', () => {
    render(<QuoteTape quotes={QUOTES} />);

    const lane = screen.getByTestId('quote-tape-lane');
    expect(lane.className).toContain('lane');
    expect(screen.getAllByTestId('quote-tape-item')).toHaveLength(
      QUOTES.length * 2,
    );

    const aaplItems = screen.getAllByText('AAPL');
    expect(aaplItems.length).toBe(2);
    const nvdaItem = screen.getAllByText('NVDA')[0].closest('.tk');
    expect(nvdaItem?.textContent).toContain('131.80');
    expect(nvdaItem?.textContent).toContain('+0.92%');
  });

  it('notifies selection when a ticker is clicked', async () => {
    const onSelectQuote = vi.fn();
    const user = userEvent.setup();

    render(<QuoteTape quotes={QUOTES} onSelectQuote={onSelectQuote} />);

    await user.click(screen.getAllByText('NVDA')[0]);
    expect(onSelectQuote).toHaveBeenCalledWith(QUOTES[1]);
  });

  it('renders the waiting message when no quotes have loaded yet', () => {
    render(<QuoteTape quotes={[]} />);
    expect(screen.getByTestId('quote-tape').textContent).toContain(
      'Waiting for quote feed',
    );
  });
});
