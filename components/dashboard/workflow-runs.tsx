"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, GitCommit, Clock } from "lucide-react";
import type { GitHubWorkflowRun } from "@/types/github";
import {
  formatRelativeTime,
  formatDuration,
  calculateDuration,
  getStatusColor,
  getStatusText,
} from "@/lib/utils/github-helpers";
import { cn } from "@/lib/utils";

interface WorkflowRunsProps {
  runs: GitHubWorkflowRun[];
  isLoading?: boolean;
}

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function WorkflowRuns({ runs, isLoading }: WorkflowRunsProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRuns = runs.filter((run) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      run.name.toLowerCase().includes(query) ||
      run.repository.full_name.toLowerCase().includes(query) ||
      run.head_branch.toLowerCase().includes(query) ||
      run.head_commit.message.toLowerCase().includes(query) ||
      run.actor.login.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Workflow Runs</CardTitle>
          <CardDescription>Loading workflow runs...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 w-48 bg-muted rounded mb-2" />
                <div className="h-4 w-full bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (runs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Workflow Runs</CardTitle>
          <CardDescription>No workflow runs found</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Recent Workflow Runs</CardTitle>
            <CardDescription>
              {runs.length} recent workflow {runs.length === 1 ? "run" : "runs"}
            </CardDescription>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search runs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-3">
            {filteredRuns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No runs match your search
              </div>
            ) : (
              filteredRuns.map((run) => {
                const statusColor = getStatusColor(run.status, run.conclusion);
                const statusText = getStatusText(run.status, run.conclusion);
                let duration = calculateDuration(
                  run.run_started_at,
                  run.status === "completed" ? run.updated_at : undefined
                );

                if (duration > 86400) duration = 86400; // Cap at 24h
                if (duration < 0) duration = 0; // Sanity check

                const commitUrl = `https://github.com/${run.repository.full_name}/commit/${run.head_sha}`;

                return (
                  <div
                    key={run.id}
                    onClick={() => window.open(run.html_url, "_blank")}
                    className="group p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200 hover:shadow-md cursor-pointer relative"
                  >
                    <div className="flex items-start gap-3">
                      {/* Status indicator */}
                      <div className="shrink-0 mt-1">
                        <div
                          className={cn(
                            "h-3 w-3 rounded-full",
                            statusColor,
                            run.status === "in_progress" && "animate-pulse"
                          )}
                        />
                      </div>

                      <div className="flex-1 space-y-1 min-w-0">
                        {/* Workflow name and status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-base font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                              <span className="truncate">{run.name}</span>
                              <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-sm text-muted-foreground truncate z-10 relative">
                              <a
                                href={`https://github.com/${run.repository.full_name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="hover:text-foreground hover:underline transition-colors"
                              >
                                {run.repository.full_name}
                              </a>
                            </div>
                          </div>
                          <Badge
                            variant={
                              run.conclusion === "success"
                                ? "default"
                                : run.conclusion === "failure"
                                ? "destructive"
                                : "secondary"
                            }
                            className="shrink-0 scale-90 origin-right"
                          >
                            {statusText}
                          </Badge>
                        </div>

                        {/* Commit message */}
                        <div className="flex items-start gap-2 text-sm z-10 relative">
                          <GitCommit className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                          <a
                            href={commitUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted-foreground hover:text-foreground hover:underline line-clamp-2 transition-colors"
                          >
                            {run.head_commit.message}
                          </a>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground w-full pt-1">
                          <div className="flex items-center gap-1 z-10 relative">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={run.actor.avatar_url} />
                              <AvatarFallback>
                                {run.actor.login[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <a
                              href={`https://github.com/${run.actor.login}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-foreground hover:underline transition-colors"
                            >
                              {run.actor.login}
                            </a>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(duration)}
                          </div>
                          <div className="flex items-center gap-1 z-10 relative">
                            <a
                              href={`https://github.com/${run.repository.full_name}/tree/${run.head_branch}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded hover:bg-muted/80 hover:text-foreground transition-colors"
                            >
                              {run.head_branch}
                            </a>
                          </div>
                          <span
                            className="ml-auto hover:text-foreground transition-colors cursor-help"
                            title={new Date(run.created_at).toLocaleString()}
                          >
                            {formatRelativeTime(run.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
