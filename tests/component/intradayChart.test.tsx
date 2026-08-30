import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IntradayChart } from '../../src/components/intraday-chart/IntradayChart';
import type { IntradayPricePoint } from '../../src/data/types';

const chartHelpers = vi.hoisted(() => {
  const updateChart = vi.fn();
  const initChart = vi.fn(() => ({
    resize: vi.fn(),
    dispose: vi.fn(),
    setOption: vi.fn(),
  }));
  return { updateChart, initChart };
});

vi.mock('../../src/lib/charts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/lib/charts')>();
  return {
    ...actual,
    initChart: chartHelpers.initChart,
    updateChart: chartHelpers.updateChart,
    disposeChart: vi.fn(),
  };
});

function buildPoints(length: number): IntradayPricePoint[] {
  const points: IntradayPricePoint[] = [];
  for (let index = 0; index < length; index += 1) {
    const minutes = 9 * 60 + 30 + index * 1;
    const volume = 1_000_000 + index * 4000;
    points.push({
      timestamp: new Date(
        2026,
        7,
        30,
        Math.floor(minutes / 60),
        minutes % 60,
        0,
      ).toISOString(),
      price: 130 + (index % 5) * 0.4,
      volume,
      vwap: 131.1,
    });
  }
  return points;
}

const POINTS = buildPoints(30);

describe('IntradayChart', () => {
  beforeEach(() => {
    chartHelpers.initChart.mockClear();
    chartHelpers.updateChart.mockClear();
  });

  it('shows header quote info (price, change, O H L, PREV)', () => {
    render(
      <IntradayChart
        symbol="NVDA"
        name="NVIDIA Corp."
        price={131.8}
        change={1.2}
        changePercent={0.92}
        previousClose={130.6}
        points={POINTS}
      />,
    );

    const panel = screen.getByTestId('intraday-panel');
    expect(panel.textContent).toContain('NVDA · NVIDIA Corp.');
    expect(panel.textContent).toContain('131.80');
    expect(panel.textContent).toContain('+0.92%');
    expect(panel.textContent).toContain('PREV');
    expect(panel.textContent).toContain('130.60');
  });

  it('mounts an eCharts canvas and feeds the price/volume option', () => {
    render(
      <IntradayChart
        symbol="NVDA"
        name="NVIDIA Corp."
        price={131.8}
        change={1.2}
        changePercent={0.92}
        previousClose={130.6}
        points={POINTS}
      />,
    );

    expect(screen.getByTestId('intraday-panel')).toBeInTheDocument();
    expect(chartHelpers.initChart).toHaveBeenCalledTimes(1);

    const series = chartHelpers.updateChart.mock.calls.map(
      (call) => (call[1] as { series?: unknown[] }).series ?? [],
    );
    const lastOption = series[series.length - 1] ?? [];
    expect(lastOption.length).toBeGreaterThanOrEqual(3);
    const priceSeries = (lastOption as Array<{ name?: string }>).find(
      (item) => item.name === 'Price',
    );
    expect(priceSeries).toBeDefined();
  });

  it('renders an empty state instead of a chart with no points', () => {
    render(
      <IntradayChart
        symbol="NVDA"
        name="NVIDIA Corp."
        price={131.8}
        change={0}
        changePercent={0}
        previousClose={130.6}
        points={[]}
      />,
    );

    expect(screen.getByTestId('intraday-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('chart-canvas')).not.toBeInTheDocument();
  });

  it('renders a loading state while a session is still being fetched', () => {
    render(
      <IntradayChart
        symbol="NVDA"
        name="NVIDIA Corp."
        price={131.8}
        change={0}
        changePercent={0}
        previousClose={130.6}
        points={[]}
        isLoading
      />,
    );

    expect(screen.getByTestId('intraday-status')).toBeInTheDocument();
  });
});
