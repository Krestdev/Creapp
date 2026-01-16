import { useQuery, QueryKey } from "@tanstack/react-query";

// Helper générique
export const useFetchQuery = <TData>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  refetchInterval: number | false = false
) =>
  useQuery<TData>({
    queryKey,
    queryFn,
    // refetchOnWindowFocus: false,
    // retryDelay: 30000,
    // refetchInterval,
  });
