import { useApiQuery } from './useApiQuery';
import type { Quote } from '../data/types';

interface QuotesResponse {
  quotes: Quote[];
}

export const QUOTES_POLL_INTERVAL_MS = 4000;

export function useQuotes() {
  return useApiQuery<QuotesResponse>(['quotes'], '/api/quotes', {
    refetchInterval: QUOTES_POLL_INTERVAL_MS,
    staleTime: 0,
    isEmpty: (data) => data?.quotes.length === 0,
  });
}
