"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { RepoList } from "@/components/dashboard/repo-list";
import { WorkflowRuns } from "@/components/dashboard/workflow-runs";
import { RateLimitIndicator } from "@/components/dashboard/rate-limit-indicator";
import { useRepositories, useWorkflowRuns } from "@/hooks/use-github-data";
import { calculateWorkflowStats, formatTime } from "@/lib/utils/github-helpers";
import { CompactRateLimit } from "@/components/dashboard/compact-rate-limit";
import { Github, LogOut, RefreshCw, User, Shield, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { AutoRefreshToggle } from "@/components/dashboard/auto-refresh-toggle";
import { useState } from "react";

const AUTO_REFRESH_INTERVAL = 60 * 1000; // 60 seconds

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false);

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

  const {
    data: workflowRuns = [],
    isLoading: runsLoading,
    refetch: refetchRuns,
    isRefetching: runsRefetching,
    dataUpdatedAt: runsUpdatedAt,
  } = useWorkflowRuns({
    enabled: !!session?.user,
    refetchInterval: isAutoRefreshEnabled ? AUTO_REFRESH_INTERVAL : false,
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/");
    }
  }, [session, isPending, router]);

  if (isPending || !session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  const stats = calculateWorkflowStats(workflowRuns, repositories.length);
  const isRefreshing = reposRefetching || runsRefetching;
  const lastUpdated = Math.max(reposUpdatedAt || 0, runsUpdatedAt || 0);

  const handleRefresh = () => {
    refetchRepos();
    refetchRuns();
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 dark:bg-none dark:bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 flex h-16 items-center justify-between max-w-[2000px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
              <Github className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                GHA View
              </h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <p>Real-time workflow monitoring</p>
                {lastUpdated > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Updated {formatTime(lastUpdated)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <AutoRefreshToggle
              isEnabled={isAutoRefreshEnabled}
              onToggle={setIsAutoRefreshEnabled}
            />
            <div className="h-6 w-px bg-border" /> {/* Separator */}
            <CompactRateLimit />
            <ModeToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-[1.2rem] w-[1.2rem] ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
              <span className="sr-only">Refresh</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10 border-2 border-primary/20 hover:border-primary transition-colors">
                    <AvatarImage
                      src={session.user.image || undefined}
                      alt={session.user.name || ""}
                    />
                    <AvatarFallback>
                      {session.user.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/profile")}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/security")}
                  className="cursor-pointer"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Security</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
                    window.open(
                      `https://github.com/settings/connections/applications/${clientId}`,
                      "_blank"
                    );
                  }}
                  className="cursor-pointer"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span>Manage Access</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600 dark:text-red-400 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="px-6 py-8 space-y-8 max-w-[2000px] mx-auto">
        {/* Rate Limit Warning */}
        <RateLimitIndicator />

        {/* Stats Overview */}
        <StatsOverview stats={stats} isLoading={reposLoading || runsLoading} />

        {/* Grid layout for repos and workflows */}
        <div className="grid gap-6 lg:grid-cols-[450px_1fr]">
          <RepoList repositories={repositories} isLoading={reposLoading} />
          <WorkflowRuns runs={workflowRuns} isLoading={runsLoading} />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center pb-8 border-t pt-8 border-border/40">
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
    </div>
  );
}
