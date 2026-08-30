import { useApiQuery } from './useApiQuery';
import type { RankingEntry, RankingTabId } from '../data/types';

interface NewsResponse {
  tab: RankingTabId;
  items: RankingEntry[];
}

export function useNews(tab: RankingTabId) {
  return useApiQuery<NewsResponse>(['news', tab], `/api/news?tab=${tab}`, {
    refetchInterval: 30_000,
    isEmpty: (data) => data?.items.length === 0,
  });
}
