"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GitCommit,
  Clock,
  GitBranch,
  Search,
  ChevronDown,
} from "lucide-react";
import type { GitHubWorkflowRun } from "@/types/github";
import {
  formatRelativeTime,
  formatDuration,
  calculateDuration,
  getStatusColor,
  getStatusTextColor,
  getStatusText,
} from "@/lib/utils/github-helpers";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface WorkflowRunsProps {
  runs: GitHubWorkflowRun[];
  isLoading?: boolean;
}

function getRunDuration(run: GitHubWorkflowRun): number {
  let duration = calculateDuration(
    run.run_started_at || run.created_at,
    run.status === "completed" ? run.updated_at : undefined
  );
  if (duration > 86400) duration = 86400;
  if (duration < 0) duration = 0;
  return duration;
}

export function WorkflowRuns({ runs, isLoading }: WorkflowRunsProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRuns = runs.filter((run) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (run.name || "").toLowerCase().includes(query) ||
      run.repository.full_name.toLowerCase().includes(query) ||
      (run.head_branch || "").toLowerCase().includes(query) ||
      (run.head_commit?.message || "").toLowerCase().includes(query) ||
      (run.actor?.login || "").toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <>
        {/* Desktop Loading */}
        <div className="hidden md:flex flex-col bg-card border border-border rounded-lg overflow-hidden h-full">
          <div className="px-3.5 py-3 border-b border-border">
            <div className="h-3 w-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="p-3 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 w-full bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>

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
        <div className="hidden md:flex flex-col items-center justify-center bg-card border border-border rounded-lg h-full py-16 text-center gap-1">
          <div className="text-sm font-semibold">No workflow runs found</div>
        </div>

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
      <div className="hidden md:flex flex-col bg-card border border-border rounded-lg overflow-hidden h-full">
        <div className="shrink-0 px-3.5 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[11px] tracking-wider text-muted-foreground uppercase">
              workflow runs
            </span>
            <span className="text-[11px] text-muted-foreground/70">
              {filteredRuns.length} / {runs.length}
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="filter runs..."
              className="bg-background border border-white/10 rounded-md py-1.5 pl-8 pr-3 text-xs w-56 outline-none placeholder:text-muted-foreground/60 focus:border-white/20"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-[#0F1216]">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="w-[90px] text-[10px] tracking-wider uppercase text-muted-foreground">
                  status
                </TableHead>
                <TableHead className="text-[10px] tracking-wider uppercase text-muted-foreground">
                  workflow
                </TableHead>
                <TableHead className="text-[10px] tracking-wider uppercase text-muted-foreground">
                  repo
                </TableHead>
                <TableHead className="text-[10px] tracking-wider uppercase text-muted-foreground">
                  branch
                </TableHead>
                <TableHead className="text-[10px] tracking-wider uppercase text-muted-foreground">
                  actor
                </TableHead>
                <TableHead className="text-right text-[10px] tracking-wider uppercase text-muted-foreground">
                  duration
                </TableHead>
                <TableHead className="text-right text-[10px] tracking-wider uppercase text-muted-foreground">
                  when
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRuns.length === 0 ? (
                <TableRow className="hover:bg-transparent border-border">
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-xs">
                    no runs match &quot;{searchQuery}&quot;
                  </TableCell>
                </TableRow>
              ) : (
                filteredRuns.map((run) => {
                  const statusColor = getStatusColor(
                    run.status || "",
                    run.conclusion || ""
                  );
                  const statusTextColor = getStatusTextColor(
                    run.status || "",
                    run.conclusion || ""
                  );
                  const statusText = getStatusText(
                    run.status || "",
                    run.conclusion || ""
                  );
                  const duration = getRunDuration(run);

                  return (
                    <TableRow
                      key={run.id}
                      onClick={() => window.open(run.html_url, "_blank")}
                      className="cursor-pointer border-border text-xs"
                    >
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full shrink-0",
                              statusColor,
                              run.status === "in_progress" && "animate-pulse"
                            )}
                          />
                          <span className={cn("text-[11px]", statusTextColor)}>
                            {statusText}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className="text-foreground font-medium max-w-[220px] truncate"
                        title={run.head_commit?.message || undefined}
                      >
                        {run.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[180px] truncate">
                        <a
                          href={`https://github.com/${run.repository.full_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-foreground hover:underline"
                        >
                          {run.repository.full_name}
                        </a>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`https://github.com/${run.repository.full_name}/tree/${run.head_branch}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white/[0.06] px-1.5 py-0.5 rounded text-[11px] text-muted-foreground truncate inline-block max-w-[140px] align-middle hover:text-foreground hover:bg-white/[0.1]"
                        >
                          {run.head_branch}
                        </a>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <a
                          href={`https://github.com/${run.actor?.login}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 hover:text-foreground"
                        >
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={run.actor?.avatar_url} />
                            <AvatarFallback className="text-[8px]">
                              {(run.actor?.login || "?")[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-[100px]">
                            {run.actor?.login || "Unknown"}
                          </span>
                        </a>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDuration(duration)}
                      </TableCell>
                      <TableCell
                        className="text-right text-muted-foreground/70"
                        title={new Date(run.created_at).toLocaleString()}
                      >
                        {formatRelativeTime(run.created_at)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Version */}
      <Collapsible
        defaultOpen
        id="workflow-runs-mobile"
        className="md:hidden flex flex-col h-full scroll-mt-10"
      >
        <CollapsibleTrigger className="px-4 py-3 border-b flex items-center justify-between w-full group">
          <div className="text-left">
            <h2 className="text-lg font-bold">Workflow Runs</h2>
            <p className="text-xs text-muted-foreground">
              {runs.length} recent {runs.length === 1 ? "run" : "runs"}
            </p>
          </div>
          <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="flex-1 min-h-0">
          <div className="px-4 py-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search runs..."
                className="w-full bg-background border border-white/10 rounded-md h-9 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-white/20"
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
                  const statusColor = getStatusColor(
                    run.status || "",
                    run.conclusion || ""
                  );
                  const statusTextColor = getStatusTextColor(
                    run.status || "",
                    run.conclusion || ""
                  );
                  const statusText = getStatusText(
                    run.status || "",
                    run.conclusion || ""
                  );
                  const duration = getRunDuration(run);

                  return (
                    <div
                      key={run.id}
                      onClick={() => window.open(run.html_url, "_blank")}
                      className="bg-card rounded-lg border border-border p-3 active:bg-white/[0.03] transition-colors space-y-2.5"
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
                            <span className={cn("text-[11px] shrink-0", statusTextColor)}>
                              {statusText}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground truncate block">
                            {run.repository.full_name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5 pl-4">
                        <GitCommit className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {run.head_commit?.message || "No commit message"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground pl-4 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={run.actor?.avatar_url} />
                            <AvatarFallback className="text-[8px]">
                              {(run.actor?.login || "?")[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-[80px]">
                            {run.actor?.login || "Unknown"}
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
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}
