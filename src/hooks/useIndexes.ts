import { useApiQuery } from './useApiQuery';
import type { IndexQuotation } from '../data/types';

interface IndexesResponse {
  indexes: IndexQuotation[];
}

export function useIndexes() {
  return useApiQuery<IndexesResponse>(['indexes'], '/api/indexes', {
    refetchInterval: 20_000,
    isEmpty: (data) => data?.indexes.length === 0,
  });
}
