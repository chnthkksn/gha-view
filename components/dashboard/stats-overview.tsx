"use client";

import type { WorkflowStats } from "@/types/github";
import { formatDuration } from "@/lib/utils/github-helpers";
import { cn } from "@/lib/utils";

interface StatsOverviewProps {
  stats: WorkflowStats;
  isLoading?: boolean;
}

interface StatCellProps {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  last?: boolean;
}

function StatCell({ label, value, valueClassName, last }: StatCellProps) {
  return (
    <div
      className={cn(
        "flex-1 min-w-[110px] px-4 py-3.5",
        !last && "border-r border-border"
      )}
    >
      <div className="text-[10px] tracking-wider text-muted-foreground/70 uppercase mb-1.5">
        {label}
      </div>
      <div className={cn("text-xl font-bold", valueClassName)}>{value}</div>
    </div>
  );
}

export function StatsOverview({ stats, isLoading }: StatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="flex flex-wrap bg-card border border-border rounded-lg">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 min-w-[110px] px-4 py-3.5 animate-pulse",
              i < 4 && "border-r border-border"
            )}
          >
            <div className="h-2.5 w-16 bg-muted rounded mb-2.5" />
            <div className="h-6 w-10 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap bg-card border border-border rounded-lg">
      <StatCell label="repos" value={stats.totalRepos} />
      <StatCell
        label="running now"
        value={stats.runningWorkflows}
        valueClassName="text-warning"
      />
      <StatCell
        label="success rate (24h)"
        value={`${stats.successRate}%`}
        valueClassName="text-primary"
      />
      <StatCell
        label="avg duration"
        value={formatDuration(stats.avgDuration)}
      />
      <StatCell
        label="runs (24h)"
        value={stats.activeRunsLast24h}
        last
      />
    </div>
  );
}
