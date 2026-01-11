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
import {
  ExternalLink,
  GitCommit,
  Clock,
  GitBranch,
  Search,
} from "lucide-react";
import type { GitHubWorkflowRun } from "@/types/github";
import {
  formatRelativeTime,
  formatDuration,
  calculateDuration,
  getStatusColor,
  getStatusText,
} from "@/lib/utils/github-helpers";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface WorkflowRunsProps {
  runs: GitHubWorkflowRun[];
  isLoading?: boolean;
}

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
      <>
        {/* Desktop Loading */}
        <Card className="hidden md:block">
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

        {/* Mobile Loading */}
        <div className="md:hidden space-y-3 px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">Workflow Runs</h2>
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          </div>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-card rounded-lg border p-3"
            >
              <div className="h-4 w-3/4 bg-muted rounded mb-2" />
              <div className="h-3 w-full bg-muted rounded mb-2" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (runs.length === 0) {
    return (
      <>
        {/* Desktop Empty */}
        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle>Recent Workflow Runs</CardTitle>
            <CardDescription>No workflow runs found</CardDescription>
          </CardHeader>
        </Card>

        {/* Mobile Empty */}
        <div className="md:hidden px-4 py-4">
          <h2 className="text-lg font-bold mb-2">Workflow Runs</h2>
          <p className="text-sm text-muted-foreground">
            No workflow runs found
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop Version */}
      <Card className="hidden md:block">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <CardTitle>Recent Workflow Runs</CardTitle>
              <CardDescription>
                {runs.length} recent workflow{" "}
                {runs.length === 1 ? "run" : "runs"}
              </CardDescription>
            </div>
            <div className="relative w-full sm:max-w-sm">
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
          <ScrollArea className="h-[400px] sm:h-[500px] lg:h-[600px] pr-2 sm:pr-4">
            <div className="space-y-2 sm:space-y-3">
              {filteredRuns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No runs match your search
                </div>
              ) : (
                filteredRuns.map((run) => {
                  const statusColor = getStatusColor(
                    run.status,
                    run.conclusion
                  );
                  const statusText = getStatusText(run.status, run.conclusion);
                  let duration = calculateDuration(
                    run.run_started_at,
                    run.status === "completed" ? run.updated_at : undefined
                  );

                  if (duration > 86400) duration = 86400;
                  if (duration < 0) duration = 0;

                  return (
                    <div
                      key={run.id}
                      onClick={() => window.open(run.html_url, "_blank")}
                      className="group p-2 sm:p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200 hover:shadow-md cursor-pointer relative"
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
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
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                                <span className="truncate">{run.name}</span>
                                <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="text-xs sm:text-sm text-muted-foreground truncate z-10 relative">
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
                              className="shrink-0 scale-75 sm:scale-90 origin-right text-xs"
                            >
                              {statusText}
                            </Badge>
                          </div>

                          <div className="flex items-start gap-2 text-xs sm:text-sm z-10 relative">
                            <GitCommit className="h-3 w-3 sm:h-4 sm:w-4 shrink-0 mt-0.5 text-muted-foreground" />
                            <a
                              href={`https://github.com/${run.repository.full_name}/commit/${run.head_sha}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-muted-foreground hover:text-foreground hover:underline line-clamp-2 transition-colors"
                            >
                              {run.head_commit.message}
                            </a>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground w-full pt-1">
                            <div className="flex items-center gap-1 z-10 relative">
                              <Avatar className="h-3 w-3 sm:h-4 sm:w-4">
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
                                className="hover:text-foreground hover:underline transition-colors truncate max-w-[100px] sm:max-w-none"
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
                                className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded hover:bg-muted/80 hover:text-foreground transition-colors truncate max-w-[120px]"
                              >
                                {run.head_branch}
                              </a>
                            </div>
                            <span
                              className="ml-auto hover:text-foreground transition-colors cursor-help whitespace-nowrap"
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

      {/* Mobile Version */}
      <div
        id="workflow-runs-mobile"
        className="md:hidden flex flex-col h-full scroll-mt-10"
      >
        <div className="px-4 py-3 border-b space-y-3">
          <div>
            <h2 className="text-lg font-bold">Workflow Runs</h2>
            <p className="text-xs text-muted-foreground">
              {runs.length} recent {runs.length === 1 ? "run" : "runs"}
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search runs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-4 py-3 space-y-3">
            {filteredRuns.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
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

                if (duration > 86400) duration = 86400;
                if (duration < 0) duration = 0;

                return (
                  <div
                    key={run.id}
                    onClick={() => window.open(run.html_url, "_blank")}
                    className="group bg-card rounded-lg border p-3 active:bg-accent/50 transition-colors space-y-2.5"
                  >
                    <div className="flex items-start gap-2">
                      <div className="shrink-0 mt-1">
                        <div
                          className={cn(
                            "h-2.5 w-2.5 rounded-full",
                            statusColor,
                            run.status === "in_progress" && "animate-pulse"
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                            {run.name}
                          </h3>
                          <Badge
                            variant={
                              run.conclusion === "success"
                                ? "default"
                                : run.conclusion === "failure"
                                ? "destructive"
                                : "secondary"
                            }
                            className="shrink-0 text-xs h-5"
                          >
                            {statusText}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {run.repository.full_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 pl-4">
                      <GitCommit className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {run.head_commit.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground pl-4 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={run.actor.avatar_url} />
                          <AvatarFallback className="text-[8px]">
                            {run.actor.login[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate max-w-[80px]">
                          {run.actor.login}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        <span className="font-mono truncate max-w-[100px]">
                          {run.head_branch}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(duration)}</span>
                      </div>
                    </div>

                    <div className="flex justify-end pl-4">
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(run.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
