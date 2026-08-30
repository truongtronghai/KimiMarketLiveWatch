import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewsPanel } from '../../src/components/news-panel/NewsPanel';
import type { RankingEntry } from '../../src/data/types';

const GAINERS: RankingEntry[] = [
  {
    id: 'g1',
    tabId: 'gainers',
    symbol: 'NVDA',
    title: 'NVDA leads Nasdaq movers',
    price: 131.8,
    changePercent: 3.08,
    reason: 'Hyperscaler capex guide · 1.9x RV',
  },
  {
    id: 'g2',
    tabId: 'gainers',
    symbol: 'AVGO',
    title: 'AVGO extends on strength',
    price: 187.4,
    changePercent: 2.21,
    reason: 'SOXX +3.1% · semis carry tape',
  },
];

const EARNINGS: RankingEntry[] = [
  {
    id: 'e1',
    tabId: 'earnings',
    symbol: 'NVDA',
    title: 'NVIDIA earnings preview',
    price: 131.8,
    changePercent: 0,
    reason: 'Guide on deck before the open',
    dateLabel: 'Aug 27 AMC',
  },
];

const NEWS: RankingEntry[] = [
  {
    id: 'n1',
    tabId: 'news',
    symbol: 'NVDA',
    title: 'NVDA pares gains as options traders take profit',
    source: 'Reuters',
    time: '10:14',
  },
];

describe('NewsPanel', () => {
  it('renders the four ranking tabs with the active one highlighted', () => {
    render(<NewsPanel activeTab="gainers" items={GAINERS} />);

    expect(screen.getByTestId('news-tab-gainers')).toBeInTheDocument();
    expect(screen.getByTestId('news-tab-active')).toBeInTheDocument();
    expect(screen.getByTestId('news-tab-earnings')).toBeInTheDocument();
    expect(screen.getByTestId('news-tab-news')).toBeInTheDocument();
    expect(screen.getByTestId('news-tab-gainers').className).toContain('on');
  });

  it('requests a different tab when a tab button is clicked', async () => {
    const onSelectTab = vi.fn();
    const user = userEvent.setup();

    render(
      <NewsPanel
        activeTab="gainers"
        items={GAINERS}
        onSelectTab={onSelectTab}
      />,
    );

    await user.click(screen.getByTestId('news-tab-news'));
    expect(onSelectTab).toHaveBeenCalledWith('news');
  });

  it('renders quote ranking rows with symbol, price, change and reason', () => {
    render(<NewsPanel activeTab="gainers" items={GAINERS} />);

    const rows = screen.getAllByTestId('ranking-row');
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain('NVDA');
    expect(rows[0].textContent).toContain('131.80');
    expect(rows[0].textContent).toContain('+3.08%');
    expect(rows[0].textContent).toContain('Hyperscaler capex guide');

    const rowClasses = rows[0].querySelector('.pc')?.className;
    expect(rowClasses).toContain('up');
  });

  it('selects the instrument represented by a ranking row', async () => {
    const onSelectQuote = vi.fn();
    const user = userEvent.setup();

    render(
      <NewsPanel
        activeTab="gainers"
        items={GAINERS}
        onSelectQuote={onSelectQuote}
      />,
    );

    await user.click(screen.getAllByTestId('ranking-row')[1]);
    expect(onSelectQuote).toHaveBeenCalledWith('AVGO');
  });

  it('renders earnings rows with a date label and arrow marker', () => {
    render(<NewsPanel activeTab="earnings" items={EARNINGS} />);

    const row = screen.getByTestId('ranking-row');
    expect(row.textContent).toContain('NVDA');
    expect(row.textContent).toContain('Aug 27 AMC');
  });

  it('renders news rows with time, source and a bolded ticker', () => {
    render(<NewsPanel activeTab="news" items={NEWS} />);

    const row = screen.getByTestId('news-row');
    expect(row.textContent).toContain('10:14 ET');
    expect(row.textContent).toContain('Reuters');
    const highlight = row.querySelector('.hl b');
    expect(highlight?.textContent).toBe('NVDA');
  });

  it('shows an empty state when a tab has no stories yet', () => {
    render(<NewsPanel activeTab="gainers" items={[]} />);
    expect(screen.getByTestId('news-empty')).toBeInTheDocument();
  });
});
