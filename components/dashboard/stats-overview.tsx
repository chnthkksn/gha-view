"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Loader2, Clock, Zap } from "lucide-react";
import type { WorkflowStats } from "@/types/github";
import { formatDuration } from "@/lib/utils/github-helpers";

interface StatsOverviewProps {
  stats: WorkflowStats;
  isLoading?: boolean;
}

export function StatsOverview({ stats, isLoading }: StatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Total Repos
          </CardTitle>
          <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalRepos}
            </div>
            <span className="text-xs text-muted-foreground">active</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Running
          </CardTitle>
          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400 animate-spin" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.runningWorkflows}
            </div>
            <span className="text-xs text-muted-foreground">workflows</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Avg. Duration
          </CardTitle>
          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatDuration(stats.avgDuration)}
            </div>
            <span className="text-xs text-muted-foreground">per run</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-teal-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Active Runners
          </CardTitle>
          <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-teal-600 dark:text-teal-400" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <div className="text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-400">
              {stats.activeRunsLast24h}
            </div>
            <span className="text-xs text-muted-foreground">last 24h</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
