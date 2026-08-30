import { useApiQuery } from './useApiQuery';
import type { SessionRead } from '../data/types';

export function useSessionRead() {
  return useApiQuery<SessionRead>(['session-read'], '/api/session-read', {
    staleTime: 60_000,
    isEmpty: (data) => data?.chips.length === 0,
  });
}
