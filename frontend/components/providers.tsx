"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import axios from "axios";
import { ClerkTokenProvider } from "./ClerkTokenProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,  // 5 min — avoids redundant refetches on tab switch
            gcTime: 10 * 60 * 1000,    // keep cache for 10 min
            // Never retry 401s — the token won't magically appear on a retry
            // Retry 500s once — they may be transient DB hiccups
            retry: (failureCount, error) => {
              if (axios.isAxiosError(error) && error.response?.status === 401) return false;
              return failureCount < 2;
            },
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ClerkTokenProvider />
      {children}
    </QueryClientProvider>
  );
}
