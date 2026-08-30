import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectorFlows } from '../../src/components/sector-flows/SectorFlows';
import type { Sector } from '../../src/data/types';

const SECTORS: Sector[] = [
  {
    id: 's-soxx',
    name: 'Semiconductors',
    symbol: 'SOXX',
    changePercent: 3.08,
    direction: 'gaining',
    netFlow: 1_240_000_000,
  },
  {
    id: 's-xlk',
    name: 'Information Technology',
    symbol: 'XLK',
    changePercent: 2.14,
    direction: 'gaining',
    netFlow: 890_000_000,
  },
  {
    id: 's-xle',
    name: 'Energy',
    symbol: 'XLE',
    changePercent: -1.26,
    direction: 'losing',
    netFlow: -310_000_000,
  },
];

describe('SectorFlows', () => {
  it('renders a heat cell per sector with intensity scaled to change', () => {
    render(<SectorFlows sectors={SECTORS} />);

    const cells = screen.getAllByTestId('sector-heat-cell');
    expect(cells).toHaveLength(3);

    const soxx = screen.getByText(/SOXX/).closest('.hcell');
    expect(soxx?.textContent).toContain('+3.08%');
    expect(soxx?.className).toContain('pos');
    expect((soxx as HTMLElement).style.getPropertyValue('--k')).toBe('28');

    const xle = screen.getByText(/XLE/).closest('.hcell');
    expect(xle?.textContent).toContain('-1.26%');
    expect(xle?.className).toContain('neg');
    expect((xle as HTMLElement).style.getPropertyValue('--k')).toBe('11');
  });

  it('renders cells in the order provided (data layer pre-sorts by magnitude)', () => {
    const shuffled = [SECTORS[2], SECTORS[0], SECTORS[1]];
    render(<SectorFlows sectors={shuffled} />);
    const cells = screen.getAllByTestId('sector-heat-cell');
    expect(cells[0].textContent).toContain('XLE');
    expect(cells[1].textContent).toContain('SOXX');
    expect(cells[2].textContent).toContain('XLK');
  });

  it('notifies with the signed percent when a sector cell is clicked', async () => {
    const onNotifyDemo = vi.fn();
    const user = userEvent.setup();

    render(<SectorFlows sectors={SECTORS} onNotifyDemo={onNotifyDemo} />);

    await user.click(screen.getByText(/SOXX/).closest('.hcell') as Element);
    expect(onNotifyDemo).toHaveBeenCalledWith(
      'Semiconductors sector +3.08% (demo)',
    );
  });

  it('renders an empty state when no sector data is available', () => {
    render(<SectorFlows sectors={[]} />);
    expect(screen.getByTestId('sector-heat-empty')).toBeInTheDocument();
  });
});
