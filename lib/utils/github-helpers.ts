import { formatDistanceToNow, format, differenceInSeconds } from "date-fns";
import type { GitHubWorkflowRun, WorkflowStats } from "@/types/github";

/**
 * Format a timestamp to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: string): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

/**
 * Format a timestamp to a readable date string
 */
export function formatDate(timestamp: string): string {
  return format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a");
}

/**
 * Format a timestamp to a readable time string (e.g., "10:30:45 AM")
 */
export function formatTime(timestamp: number | Date): string {
  return format(new Date(timestamp), "h:mm:ss a");
}

/**
 * Calculate workflow duration in seconds
 */
export function calculateDuration(startTime: string, endTime?: string): number {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  return differenceInSeconds(end, start);
}

/**
 * Format duration in a human-readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

/**
 * Get status color for workflow runs
 */
export function getStatusColor(
  status: string,
  conclusion: string | null
): string {
  if (status === "queued") {
    return "bg-gray-500";
  }

  if (status === "in_progress") {
    return "bg-blue-500";
  }

  if (status === "completed") {
    switch (conclusion) {
      case "success":
        return "bg-green-500";
      case "failure":
        return "bg-red-500";
      case "cancelled":
        return "bg-gray-500";
      case "skipped":
        return "bg-gray-400";
      case "timed_out":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  }

  return "bg-gray-500";
}

/**
 * Get status text for workflow runs
 */
export function getStatusText(
  status: string,
  conclusion: string | null
): string {
  if (status === "queued") {
    return "Queued";
  }

  if (status === "in_progress") {
    return "In Progress";
  }

  if (status === "completed" && conclusion) {
    return (
      conclusion.charAt(0).toUpperCase() + conclusion.slice(1).replace("_", " ")
    );
  }

  return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
}

/**
 * Calculate workflow statistics
 */
export function calculateWorkflowStats(
  runs: GitHubWorkflowRun[],
  totalRepos: number
): WorkflowStats {
  const runningWorkflows = runs.filter(
    (run) => run.status === "in_progress"
  ).length;

  const completedRuns = runs.filter((run) => run.status === "completed");
  const successfulRuns = completedRuns.filter(
    (run) => run.conclusion === "success"
  ).length;
  const failedRuns = completedRuns.filter(
    (run) => run.conclusion === "failure"
  ).length;

  const successRate =
    completedRuns.length > 0
      ? (successfulRuns / completedRuns.length) * 100
      : 0;

  const failureRate =
    completedRuns.length > 0 ? (failedRuns / completedRuns.length) * 100 : 0;

  // Calculate Average Duration
  // Filter for runs in the last 30 days to prevent ancient runs from skewing stats
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const recentCompletedRuns = completedRuns.filter(
    (run) => new Date(run.created_at) > thirtyDaysAgo
  );

  const totalDuration = recentCompletedRuns.reduce((acc, run) => {
    // Only calculate if we have both start and update times, and run_started_at is usually more accurate if available
    const start = run.run_started_at || run.created_at;
    const end = run.updated_at; // Use updated_at as proxy for completion time

    let duration = calculateDuration(start, end);

    // Sanity check: If duration is > 24 hours (86400s), it's likely a bug or stale run. Cap it or ignore.
    // Also ignore negative durations.
    if (duration < 0) return acc;
    if (duration > 86400) duration = 86400; // Cap at 24 hours

    return acc + duration;
  }, 0);

  const avgDuration =
    recentCompletedRuns.length > 0
      ? Math.round(totalDuration / recentCompletedRuns.length)
      : 0;

  // Calculate Active Runs (Last 24h)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const activeRunsLast24h = runs.filter(
    (run) => new Date(run.created_at) > oneDayAgo
  ).length;

  return {
    totalRepos,
    runningWorkflows,
    successRate: Math.round(successRate),
    failureRate: Math.round(failureRate),
    totalRuns: runs.length,
    avgDuration,
    activeRunsLast24h,
  };
}

/**
 * Group workflow runs by repository
 */
export function groupRunsByRepository(
  runs: GitHubWorkflowRun[]
): Record<string, GitHubWorkflowRun[]> {
  return runs.reduce((acc, run) => {
    const repoName = run.repository.full_name;
    if (!acc[repoName]) {
      acc[repoName] = [];
    }
    acc[repoName].push(run);
    return acc;
  }, {} as Record<string, GitHubWorkflowRun[]>);
}

/**
 * Format duration in a compact human-readable format (e.g., "1m 30s")
 */
export function formatDurationCompact(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Calculate per-repository workflow statistics
 */
export function calculateRepoStats(
  runs: GitHubWorkflowRun[],
  repoName: string
): import("@/types/github").RepoWorkflowStats {
  const completedRuns = runs.filter((run) => run.status === "completed");
  const successfulRuns = completedRuns.filter(
    (run) => run.conclusion === "success"
  ).length;

  const successRate =
    completedRuns.length > 0
      ? Math.round((successfulRuns / completedRuns.length) * 100)
      : 0;

  // Duration calculations (only for successful runs to be meaningful, or all completed?)
  // Usually usage stats include all completed runs.
  const durations = completedRuns
    .map((run) => {
      const start = run.run_started_at || run.created_at;
      const end = run.updated_at;
      const duration = calculateDuration(start, end);
      return duration > 0 && duration < 86400 ? duration : 0;
    })
    .filter((d) => d > 0);

  const totalDuration = durations.reduce((a, b) => a + b, 0);
  const avgDuration =
    durations.length > 0 ? Math.round(totalDuration / durations.length) : 0;
  const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;

  return {
    repoName,
    totalRuns: runs.length,
    successRate,
    avgDuration,
    minDuration,
    maxDuration,
  };
}
