import { useApiQuery } from './useApiQuery';
import type { IntradaySeries } from '../data/types';

export function useIntradaySeries(symbol: string | undefined) {
  const activeSymbol = symbol ?? 'NVDA';
  return useApiQuery<IntradaySeries>(
    ['intraday', activeSymbol],
    `/api/intraday?symbol=${encodeURIComponent(activeSymbol)}`,
    {
      enabled: true,
      staleTime: 30_000,
      isEmpty: (data) => data?.points.length === 0,
    },
  );
}
