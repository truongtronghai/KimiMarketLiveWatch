import { useApiQuery } from './useApiQuery';
import type { HoldingPosition } from '../data/types';

interface HoldingsResponse {
  holdings: HoldingPosition[];
}

export function useHoldings() {
  return useApiQuery<HoldingsResponse>(['holdings'], '/api/holdings', {
    refetchInterval: 4000,
    isEmpty: (data) => data?.holdings.length === 0,
  });
}
