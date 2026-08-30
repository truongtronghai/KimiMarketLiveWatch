import { useEffect, useRef } from 'react';
import type { EChartsCoreOption } from 'echarts/core';
import { initChart, updateChart, disposeChart } from '../../lib/charts';

interface ChartCanvasProps {
  id?: string;
  className?: string;
  buildOption: () => EChartsCoreOption;
  deps?: ReadonlyArray<unknown>;
  ariaLabel?: string;
}

export function ChartCanvas({
  id,
  className,
  buildOption,
  deps = [],
  ariaLabel,
}: ChartCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof initChart> | null>(null);
  const buildOptionRef = useRef(buildOption);

  // Keep the latest builder available to the chart without reading refs during render.
  useEffect(() => {
    buildOptionRef.current = buildOption;
  }, [buildOption]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const instance = initChart(container, buildOptionRef.current());
    chartRef.current = instance;

    const handleResize = (): void => instance.resize();
    const handleThemeChange = (): void =>
      updateChart(instance, buildOptionRef.current(), true);
    window.addEventListener('resize', handleResize);
    window.addEventListener('kit:theme', handleThemeChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('kit:theme', handleThemeChange);
      disposeChart(instance);
      chartRef.current = null;
    };
  }, []);

  // Re-run the chart option whenever the caller's data dependencies change.
  // The dependency list comes from the caller (`deps`), so it cannot be an array literal here.
  useEffect(() => {
    const instance = chartRef.current;
    if (instance) {
      updateChart(instance, buildOptionRef.current());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return (
    <div
      ref={containerRef}
      id={id}
      className={className}
      role="img"
      aria-label={ariaLabel ?? 'Chart'}
      data-testid="chart-canvas"
    />
  );
}
