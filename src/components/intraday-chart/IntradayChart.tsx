import type { EChartsCoreOption } from 'echarts/core';
import type { IntradayPricePoint } from '../../data/types';
import { buildAxis, buildBaseOption, readCssVariable } from '../../lib/charts';
import {
  directionClass,
  formatCompact,
  formatPrice,
  formatSignedChange,
  formatSignedPercent,
} from '../../lib/format';
import { ChartCanvas } from '../chart/ChartCanvas';

interface IntradayChartProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  points: IntradayPricePoint[];
  isError?: boolean;
  isLoading?: boolean;
}

interface Measurement {
  open: number;
  high: number;
  low: number;
}

function extractMeasurements(points: IntradayPricePoint[]): Measurement {
  const prices = points.map((point) => point.price);
  return {
    open: prices[0] ?? 0,
    high: prices.length > 0 ? Math.max(...prices) : 0,
    low: prices.length > 0 ? Math.min(...prices) : 0,
  };
}

function sessionLabel(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function buildChartOption(
  previousClose: number,
  points: IntradayPricePoint[],
): EChartsCoreOption {
  const isPositiveSession =
    previousClose > 0
      ? points[points.length - 1]?.price >= previousClose
      : false;
  const trendColor =
    readCssVariable(isPositiveSession ? 'pos' : 'neg') || '#00bb7f';
  const labels = points.map((point) => sessionLabel(point.timestamp));
  const prices = points.map((point) => point.price);
  const volumes = points.map((point) => point.volume);
  const vwaps = points.map((point) => point.vwap);

  const volumeColors = volumes.map((_volume, index) =>
    index > 0 && prices[index] < prices[index - 1]
      ? readCssVariable('neg')
      : readCssVariable('pos'),
  );

  return {
    ...buildBaseOption(),
    animation: false,
    grid: [
      { left: 10, right: 62, top: 16, height: '56%' },
      { left: 10, right: 62, top: '70%', height: '20%' },
    ],
    xAxis: [
      {
        ...buildAxis('category', {
          data: labels,
          boundaryGap: false,
          axisLabel: { interval: 59 },
        }),
        gridIndex: 0,
      },
      {
        ...buildAxis('category', {
          data: labels,
          boundaryGap: false,
          axisLabel: { show: false },
        }),
        gridIndex: 1,
      },
    ],
    yAxis: [
      {
        ...buildAxis('value', {
          scale: true,
          position: 'right',
          axisLabel: { formatter: (value: number) => value.toFixed(2) },
        }),
        gridIndex: 0,
      },
      {
        ...buildAxis('value', {
          position: 'right',
          axisLabel: { formatter: (value: number) => formatCompact(value) },
        }),
        gridIndex: 1,
      },
    ],
    series: [
      {
        name: 'Price',
        type: 'line',
        data: prices,
        showSymbol: false,
        symbol: 'none',
        lineStyle: { width: 1.6, color: trendColor },
        itemStyle: { color: trendColor },
        areaStyle: { color: trendColor, opacity: 0.08 },
        markLine: {
          symbol: 'none',
          silent: true,
          label: {
            show: true,
            formatter: 'PREV',
            fontSize: 9,
            color: readCssVariable('faint') || '#565656',
            fontFamily: readCssVariable('mono'),
          },
          lineStyle: {
            type: [4, 4],
            color: readCssVariable('faint') || '#565656',
            width: 1,
          },
          data: [{ yAxis: previousClose }],
        },
      },
      {
        name: 'VWAP',
        type: 'line',
        data: vwaps,
        showSymbol: false,
        symbol: 'none',
        lineStyle: { width: 1, color: readCssVariable('accent') || '#3080ff' },
        itemStyle: { color: readCssVariable('accent') || '#3080ff' },
      },
      {
        name: 'Vol',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumes.map((value, index) => ({
          value,
          itemStyle: { color: volumeColors[index] ?? '#00bb7f', opacity: 0.5 },
        })),
        barWidth: '62%',
      },
    ],
  };
}

export function IntradayChart({
  symbol,
  name,
  price,
  change,
  changePercent,
  previousClose,
  points,
  isError,
  isLoading,
}: IntradayChartProps) {
  const measurements = extractMeasurements(points);

  return (
    <section data-testid="intraday-panel">
      <div className="chead">
        <span className="stk">
          {symbol} · {name}
        </span>
        <span className={`big ${directionClass(change)}`}>
          {formatPrice(price)}
        </span>
        <span className={`chg ${directionClass(change)}`}>
          {formatSignedPercent(changePercent)} {formatSignedChange(change)}
        </span>
        <span className="oh">
          <span>
            O {formatPrice(measurements.open)} H{' '}
            {formatPrice(measurements.high)} L {formatPrice(measurements.low)}
          </span>
          <span>
            PREV <b>{formatPrice(previousClose)}</b>
          </span>
        </span>
      </div>
      {isLoading && points.length === 0 ? (
        <div className="status-line" data-testid="intraday-status">
          Loading session…
        </div>
      ) : isError && points.length === 0 ? (
        <div className="empty" data-testid="intraday-empty">
          Unable to load intraday data
        </div>
      ) : points.length === 0 ? (
        <div className="empty" data-testid="intraday-empty">
          No intraday data for this session
        </div>
      ) : (
        <div className="cbody">
          <ChartCanvas
            id="c-main"
            className="chart"
            ariaLabel={`Intraday price chart for ${symbol}`}
            buildOption={() => buildChartOption(previousClose, points)}
            deps={[symbol, previousClose, points]}
          />
        </div>
      )}
    </section>
  );
}
