import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IndexStrip } from '../../src/components/index-strip/IndexStrip';
import type { IndexQuotation } from '../../src/data/types';

const INDEXES: IndexQuotation[] = [
  {
    id: 'idx-spx',
    name: 'S&P 500',
    symbol: 'SPX',
    level: 5634.2,
    change: 18.9,
    changePercent: 0.34,
  },
  {
    id: 'idx-ndx',
    name: 'Nasdaq 100',
    symbol: 'NDX',
    level: 19648.7,
    change: 82.4,
    changePercent: 0.42,
  },
  {
    id: 'idx-dji',
    name: 'Dow Jones',
    symbol: 'DJI',
    level: 41286.4,
    change: -36.5,
    changePercent: -0.09,
  },
];

describe('IndexStrip', () => {
  it('renders an index pill per index with level and signed change', () => {
    render(<IndexStrip indexes={INDEXES} />);

    const spx = screen.getByTestId('index-SPX');
    expect(spx.textContent).toContain('SPX');
    expect(spx.textContent).toContain('5,634.20');
    expect(spx.textContent).toContain('+0.34%');
    expect(spx.textContent).toContain('+18.90');

    expect(screen.getByTestId('index-NDX').textContent).toContain('19,648.70');
    expect(screen.getByTestId('index-DJI').textContent).toContain('-0.09%');
  });

  it('marks the selected index and notifies the demo handler on click', async () => {
    const onSelectIndex = vi.fn();
    const onNotifyDemo = vi.fn();
    const user = userEvent.setup();

    render(
      <IndexStrip
        indexes={INDEXES}
        selectedIndexId="idx-ndx"
        onSelectIndex={onSelectIndex}
        onNotifyDemo={onNotifyDemo}
      />,
    );

    expect(screen.getByTestId('index-NDX').className).toContain('on');

    await user.click(screen.getByTestId('index-SPX'));
    expect(onSelectIndex).toHaveBeenCalledWith(INDEXES[0]);
    expect(onNotifyDemo).toHaveBeenCalledWith(
      'Index detail is a demo placeholder',
    );
  });

  it('renders an empty state when there are no indexes', () => {
    render(<IndexStrip indexes={[]} />);
    expect(screen.getByTestId('index-strip').textContent).toContain(
      'No indexes available',
    );
  });
});
