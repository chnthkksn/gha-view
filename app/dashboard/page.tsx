"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import PullToRefresh from "react-simple-pull-to-refresh";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { RepoList } from "@/components/dashboard/repo-list";
import type { GitHubRepository, GitHubWorkflowRun } from "@/types/github";
import { WorkflowRuns } from "@/components/dashboard/workflow-runs";
import { RateLimitIndicator } from "@/components/dashboard/rate-limit-indicator";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MobileStatusBar } from "@/components/dashboard/mobile-status-bar";
import { useRepositories } from "@/hooks/use-github-data";
import { calculateWorkflowStats } from "@/lib/utils/github-helpers";
import { Github, RefreshCw } from "lucide-react";
import { useSetDashboard } from "@/contexts/dashboard-context";

const AUTO_REFRESH_INTERVAL = 60 * 1000; // 60 seconds

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false);
  const setDashboard = useSetDashboard();

  const {
    data: repositories = [],
    isLoading: reposLoading,
    refetch: refetchRepos,
    isRefetching: reposRefetching,
    dataUpdatedAt: reposUpdatedAt,
  } = useRepositories({
    enabled: !!session?.user,
    refetchInterval: isAutoRefreshEnabled ? AUTO_REFRESH_INTERVAL : false,
  });

  // Extract recent runs from repositories for the "Latest Runs" section
  // This avoids a second API call to getAllWorkflowRuns
  const workflowRuns = useMemo(() => {
    if (!repositories) return [];
    return repositories
      .flatMap((repo: GitHubRepository) => repo.recent_runs || [])
      .sort(
        (a: GitHubWorkflowRun, b: GitHubWorkflowRun) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [repositories]);

  // We no longer need a separate loading state for runs since they come with repos
  const runsLoading = reposLoading;
  const runsRefetching = reposRefetching; // Runs refetching status is tied to repos
  const runsUpdatedAt = reposUpdatedAt; // Runs updated at status is tied to repos

  const stats = calculateWorkflowStats(workflowRuns, repositories.length);
  const isRefreshing = reposRefetching || runsRefetching;
  const lastUpdated = Math.max(reposUpdatedAt || 0, runsUpdatedAt || 0);

  const handleRefresh = async () => {
    await Promise.all([refetchRepos()]); // Only need to refetch repos now
  };

  // Update dashboard context with current state
  useEffect(() => {
    setDashboard({
      onRefresh: () => {
        refetchRepos();
      },
      isRefreshing,
      isAutoRefreshEnabled,
      onAutoRefreshToggle: setIsAutoRefreshEnabled,
    });
  }, [
    isRefreshing,
    isAutoRefreshEnabled,
    refetchRepos,
    setDashboard,
  ]);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/");
    }
  }, [session, isPending, router]);

  // Handle scroll-to query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scrollTo = params.get("scrollTo");

    if (scrollTo === "workflows") {
      // Small delay to ensure content is rendered
      const timer = setTimeout(() => {
        const element = document.getElementById("workflow-runs-mobile");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          // Clean up URL without reloading
          window.history.replaceState({}, "", "/dashboard");
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

  if (isPending || !session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  const pullingContent = (
    <div className="flex flex-col items-center justify-center py-4">
      <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin" />
      <span className="text-sm text-muted-foreground mt-2">
        Pull to refresh
      </span>
    </div>
  );

  const refreshingContent = (
    <div className="flex flex-col items-center justify-center py-4">
      <RefreshCw className="h-6 w-6 text-primary animate-spin" />
      <span className="text-sm text-primary mt-2">Refreshing...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 dark:bg-none dark:bg-background">
      {/* Desktop Header */}
      <DashboardHeader
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        isAutoRefreshEnabled={isAutoRefreshEnabled}
        onRefresh={() => {
          refetchRepos();
        }}
        onAutoRefreshToggle={setIsAutoRefreshEnabled}
      />

      {/* Mobile Status Bar */}
      <MobileStatusBar lastUpdated={lastUpdated} isRefreshing={isRefreshing} />

      {/* Main content wrapped with PullToRefresh for mobile */}
      <PullToRefresh
        onRefresh={handleRefresh}
        pullingContent={pullingContent}
        refreshingContent={refreshingContent}
        pullDownThreshold={80}
        maxPullDownDistance={120}
        resistance={2.5}
        className="min-h-[calc(100vh-64px)]"
      >
        <main className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 pb-20 md:pb-8 space-y-4 sm:space-y-6 md:space-y-8 max-w-[2000px] mx-auto">
          {/* Rate Limit Warning */}
          <RateLimitIndicator />
          {/* Stats Overview */}
          <StatsOverview
            stats={stats}
            isLoading={reposLoading || runsLoading}
          />
          {/* Grid layout for repos and workflows */}
          <div
            className="grid gap-4 sm:gap-6 lg:grid-cols-[450px_1fr]"
            data-workflow-section
          >
            <RepoList repositories={repositories} isLoading={reposLoading} />
            {/* Desktop version - hidden on mobile */}
            <WorkflowRuns runs={workflowRuns} isLoading={runsLoading} />
          </div>
          {/* Footer */}
          <div className="mt-6 sm:mt-8 text-center pb-6 sm:pb-8 border-t pt-6 sm:pt-8 border-border/40">
            <a
              href="https://github.com/chnthkksn/gha-view"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>Star on GitHub</span>
            </a>
          </div>
        </main>
      </PullToRefresh>
    </div>
  );
}
