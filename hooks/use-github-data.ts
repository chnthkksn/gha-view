"use client";

import { useQuery } from "@tanstack/react-query";

interface UseRepositoriesOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

interface UseWorkflowRunsOptions {
  enabled?: boolean;
  status?: "queued" | "in_progress" | "completed";
  limit?: number;
  refetchInterval?: number | false;
}

export function useRepositories(options: UseRepositoriesOptions = {}) {
  const { enabled = true, refetchInterval = false } = options;

  return useQuery({
    queryKey: ["repositories"],
    queryFn: async () => {
      const response = await fetch("/api/repos");
      if (!response.ok) {
        throw new Error("Failed to fetch repositories");
      }
      const result = await response.json();
      return result.repositories || [];
    },
    enabled,
    refetchInterval,
    staleTime: 5 * 60 * 1000, // 5 minutes - repos don't change often
  });
}

export function useWorkflowRuns(options: UseWorkflowRunsOptions = {}) {
  const { enabled = true, status, limit, refetchInterval = false } = options;

  return useQuery({
    queryKey: ["workflow-runs", status, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (limit) params.set("limit", String(limit));

      const response = await fetch(`/api/workflows?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch workflow runs");
      }
      const result = await response.json();
      return result.workflow_runs || [];
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds for workflow runs
  });
}
