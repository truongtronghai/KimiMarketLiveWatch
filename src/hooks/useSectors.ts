import { useApiQuery } from './useApiQuery';
import type { Sector } from '../data/types';

interface SectorsResponse {
  sectors: Sector[];
}

export function useSectors() {
  return useApiQuery<SectorsResponse>(['sectors'], '/api/sectors', {
    refetchInterval: 60_000,
    isEmpty: (data) => data?.sectors.length === 0,
  });
}
