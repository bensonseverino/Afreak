import { QueryClient } from '@tanstack/react-query';

// Shared config: cache for 30s (spec), no retry on 4xx, don't refetch on focus.
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error?.status >= 400 && error?.status < 500) return false;
          return failureCount < 2;
        },
      },
    },
  });
}

// A single client for the app. Exported so non-React modules (`lib/api.js`) can
// clear cached account data from an error handler without a hook.
export const queryClient = makeQueryClient();

export default queryClient;
