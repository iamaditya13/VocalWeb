"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ClerkTokenProvider } from "./ClerkTokenProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,  // 5 min — avoids redundant refetches on tab switch
            gcTime: 10 * 60 * 1000,    // keep cache for 10 min
            retry: 1,
            refetchOnWindowFocus: false,
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
