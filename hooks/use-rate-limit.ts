"use client";

import { useQuery } from "@tanstack/react-query";

export interface RateLimitData {
  resources: {
    core: {
      limit: number;
      remaining: number;
      reset: number;
      used: number;
    };
  };
}

export function useRateLimit() {
  return useQuery<RateLimitData>({
    queryKey: ["rate-limit"],
    queryFn: async () => {
      const response = await fetch("/api/rate-limit");
      if (!response.ok) {
        throw new Error("Failed to fetch rate limit");
      }
      return response.json();
    },
    refetchInterval: 60 * 1000, // Check every minute
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
  });
}
