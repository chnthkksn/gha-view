"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, GitBranch, Star, Lock, User, Building } from "lucide-react";
import type { GitHubRepository } from "@/types/github";
import {
  formatRelativeTime,
  formatDurationCompact,
} from "@/lib/utils/github-helpers";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RepoListProps {
  repositories: GitHubRepository[];
  isLoading?: boolean;
  selectedRepo?: string | null;
  onRepoClick?: (fullName: string) => void;
}

function successColor(rate: number): string {
  if (rate >= 90) return "text-primary";
  if (rate >= 60) return "text-warning";
  return "text-destructive";
}

export function RepoList({
  repositories,
  isLoading,
  selectedRepo,
  onRepoClick,
}: RepoListProps) {
  if (isLoading) {
    return (
      <>
        {/* Desktop Loading */}
        <div className="hidden md:flex flex-col bg-card border border-border rounded-lg overflow-hidden h-full">
          <div className="px-3.5 py-3 border-b border-border">
            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
          </div>
          <div className="p-3 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 w-full bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>

        {/* Mobile Loading */}
        <div className="md:hidden space-y-3 px-4 py-4">
          <div className="mb-4">
            <h2 className="text-lg font-bold">Repositories</h2>
            <p className="text-xs text-muted-foreground">Loading...</p>
          </div>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-card rounded-lg border p-3"
            >
              <div className="h-4 w-3/4 bg-muted rounded mb-2" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (repositories.length === 0) {
    return (
      <>
        {/* Desktop Empty */}
        <div className="hidden md:flex flex-col items-center justify-center bg-card border border-border rounded-lg h-full py-16 text-center">
          <div className="text-sm text-muted-foreground">
            No repositories found with GitHub Actions enabled
          </div>
        </div>

        {/* Mobile Empty */}
        <div className="md:hidden px-4 py-4">
          <h2 className="text-lg font-bold mb-2">Repositories</h2>
          <p className="text-sm text-muted-foreground">
            No repositories found with GitHub Actions enabled
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden md:flex flex-col bg-card border border-border rounded-lg overflow-hidden h-full">
        <div className="shrink-0 px-3.5 py-3 border-b border-border flex items-center justify-between">
          <span className="text-[11px] tracking-wider text-muted-foreground uppercase">
            repositories
          </span>
          <span className="text-[11px] text-muted-foreground/70">
            {repositories.length}
          </span>
        </div>
        {selectedRepo && (
          <div className="shrink-0 px-3.5 py-2 bg-white/[0.03] border-b border-border flex items-center justify-between">
            <span className="text-[11px] text-primary truncate">
              filtered: {selectedRepo}
            </span>
            <button
              onClick={() => onRepoClick?.(selectedRepo)}
              className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer shrink-0 ml-2"
            >
              clear
            </button>
          </div>
        )}
        <ScrollArea className="flex-1 min-h-0">
          <div>
            {repositories.map((repo) => (
              <div
                key={repo.id}
                onClick={() => onRepoClick?.(repo.full_name)}
                className={cn(
                  "group px-3.5 py-2.5 border-b border-border/50 cursor-pointer transition-colors last:border-b-0",
                  selectedRepo === repo.full_name
                    ? "bg-white/[0.05]"
                    : "hover:bg-white/[0.03]"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-foreground truncate flex-1">
                    {repo.full_name}
                  </span>
                  {repo.private && (
                    <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                  {repo.stats && (
                    <span
                      className={cn(
                        "text-[11px] font-semibold shrink-0",
                        successColor(repo.stats.successRate || 0)
                      )}
                    >
                      {repo.stats.successRate}%
                    </span>
                  )}
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </a>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[10.5px] text-muted-foreground/70">
                  {repo.owner.type === "Organization" ? (
                    <Building className="h-2.5 w-2.5" />
                  ) : (
                    <User className="h-2.5 w-2.5" />
                  )}
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#4C7CF3]" />
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="h-2.5 w-2.5" />
                    {repo.stargazers_count}
                  </span>
                  <span className="ml-auto">
                    {formatRelativeTime(repo.updated_at)}
                  </span>
                </div>
                {repo.stats && (
                  <div className="grid grid-cols-3 gap-2 text-[10.5px] text-muted-foreground/70 pt-1.5 mt-1.5 border-t border-border/40">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-foreground">
                        {formatDurationCompact(repo.stats.minDuration || 0)}
                      </span>
                      min
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-medium text-foreground">
                        {formatDurationCompact(repo.stats.avgDuration || 0)}
                      </span>
                      avg
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <span className="font-medium text-foreground">
                        {formatDurationCompact(repo.stats.maxDuration || 0)}
                      </span>
                      max
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Mobile Version */}
      <Collapsible defaultOpen className="md:hidden flex flex-col h-full">
        <CollapsibleTrigger className="px-4 py-3 border-b flex items-center justify-between w-full group">
          <div className="text-left">
            <h2 className="text-lg font-bold">Repositories</h2>
            <p className="text-xs text-muted-foreground">
              {repositories.length}{" "}
              {repositories.length === 1 ? "repository" : "repositories"} with
              Actions
            </p>
          </div>
          <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>

        <CollapsibleContent className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="px-4 py-3 space-y-3">
              {repositories.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-card rounded-lg border p-3 active:bg-white/[0.03] transition-colors space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <div className="shrink-0 mt-0.5">
                      {repo.owner.type === "Organization" ? (
                        <Building className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">
                          {repo.full_name}
                        </h3>
                        {repo.private && (
                          <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pl-6 w-full pr-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      {repo.language && (
                        <div className="flex items-center gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full bg-[#4C7CF3]" />
                          <span>{repo.language}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        <span>{repo.stargazers_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        <span>{formatRelativeTime(repo.updated_at)}</span>
                      </div>
                    </div>

                    {repo.stats && (
                      <div className="flex items-center gap-1">
                        <span
                          className={cn(
                            "font-medium",
                            successColor(repo.stats.successRate || 0)
                          )}
                        >
                          {repo.stats.successRate}%
                        </span>
                        success
                      </div>
                    )}
                  </div>
                  {repo.stats && (
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground px-4 pb-1 pt-2 border-t border-border/50 mt-2">
                       <div className="flex items-center gap-1">
                        <span className="font-medium text-foreground">
                          {formatDurationCompact(repo.stats.minDuration || 0)}
                        </span>
                        min
                      </div>
                      <div className="flex items-center justify-center gap-1">
                          <span className="font-medium text-foreground">
                            {formatDurationCompact(repo.stats.avgDuration || 0)}
                          </span>
                          avg
                        </div>
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-medium text-foreground">
                          {formatDurationCompact(repo.stats.maxDuration || 0)}
                        </span>
                        max
                      </div>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}
