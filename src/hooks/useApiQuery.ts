import { useQuery } from '@tanstack/react-query';
import type {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

export type ApiQueryResult<TData> = UseQueryResult<TData, Error> & {
  isEmpty: boolean;
};

interface ApiQueryOptions<TData> extends Omit<
  UseQueryOptions<TData, Error>,
  'queryKey' | 'queryFn'
> {
  refetchInterval?: number | false;
  isEmpty?: (data: TData | undefined) => boolean;
}

async function fetchJson<TResponse>(url: string): Promise<TResponse> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as TResponse;
}

export function useApiQuery<TData>(
  queryKey: QueryKey,
  url: string,
  options: ApiQueryOptions<TData> = {},
): ApiQueryResult<TData> {
  const { isEmpty, ...queryOptions } = options;
  const queryResult = useQuery<TData, Error>({
    queryKey,
    queryFn: () => fetchJson<TData>(url),
    refetchInterval: queryOptions.refetchInterval ?? false,
    staleTime: queryOptions.staleTime ?? 5000,
    ...queryOptions,
  });

  const isEffectivelyEmpty = isEmpty
    ? isEmpty(queryResult.data)
    : queryResult.data == null;

  return {
    ...queryResult,
    isEmpty: isEffectivelyEmpty,
  };
}
