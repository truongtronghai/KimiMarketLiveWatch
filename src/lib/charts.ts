import * as echarts from 'echarts/core';
import { LineChart, BarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  MarkLineComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsCoreOption } from 'echarts/core';

echarts.use([
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  MarkLineComponent,
  CanvasRenderer,
]);

export type ChartType = 'category' | 'value';

export function readCssVariable(name: string): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(`--${name}`)
    .trim();
  return raw.length > 0 ? raw : '';
}

export function getMonoFont(): string {
  return (
    readCssVariable('mono') ||
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace'
  );
}

export function getSansFont(): string {
  return (
    readCssVariable('sans') ||
    'ui-sans-serif, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'
  );
}

export function buildBaseOption(): EChartsCoreOption {
  const panel = readCssVariable('panel') || '#0d0d0d';
  const line = readCssVariable('line') || '#2e2e2e';
  const lineSoft = readCssVariable('line-soft') || '#1c1c1c';
  const ink = readCssVariable('ink') || '#ffffff';
  const faint = readCssVariable('faint') || '#565656';
  const mono = getMonoFont();
  const sans = getSansFont();

  return {
    animationDuration: 620,
    animationEasing: 'cubicOut',
    textStyle: { fontFamily: sans, fontSize: 11 },
    grid: { left: 8, right: 8, top: 18, bottom: 4, containLabel: true },
    tooltip: {
      backgroundColor: panel,
      borderColor: line,
      borderWidth: 1,
      padding: [7, 10],
      textStyle: { color: ink, fontSize: 11.5 },
      extraCssText:
        'border-radius:6px;box-shadow:none;backdrop-filter:blur(6px)',
      axisPointer: { lineStyle: { color: faint, width: 1, type: [3, 3] } },
    },
    categoryAxis: {
      axisLine: { lineStyle: { color: line } },
      axisTick: { show: false },
      axisLabel: { color: faint, fontSize: 10.5 },
      splitLine: { show: false },
    },
    valueAxis: {
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: faint, fontSize: 10.5, fontFamily: mono },
      splitLine: { lineStyle: { color: lineSoft, type: [3, 4] } },
    },
  };
}

export function buildAxis(
  type: ChartType,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  const baseOption = buildBaseOption();
  const axisBase = (
    type === 'category' ? baseOption.categoryAxis : baseOption.valueAxis
  ) as Record<string, unknown>;
  return { ...axisBase, ...overrides };
}

export function initChart(
  dom: HTMLDivElement,
  option: EChartsCoreOption,
): echarts.ECharts {
  const instance = echarts.init(dom, undefined, { renderer: 'canvas' });
  instance.setOption(option);
  return instance;
}

export function updateChart(
  instance: echarts.ECharts,
  option: EChartsCoreOption,
  notMerge = false,
): void {
  instance.setOption(option, { notMerge });
}

export function disposeChart(instance: echarts.ECharts | undefined): void {
  instance?.dispose();
}
