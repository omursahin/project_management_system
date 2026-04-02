import { QueryClient } from "@tanstack/react-query";

export function createQueryClient(overrides = {}) {
  const {
    queries: queryOverrides = {},
    mutations: mutationOverrides = {},
  } = overrides;

  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        ...queryOverrides,
      },
      mutations: {
        retry: 0,
        ...mutationOverrides,
      },
    },
  });
}

export const queryClient = createQueryClient();
