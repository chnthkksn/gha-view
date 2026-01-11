"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ExternalLink,
  GitBranch,
  Star,
  Lock,
  User,
  Building,
} from "lucide-react";
import type { GitHubRepository } from "@/types/github";
import { formatRelativeTime } from "@/lib/utils/github-helpers";

interface RepoListProps {
  repositories: GitHubRepository[];
  isLoading?: boolean;
}

export function RepoList({ repositories, isLoading }: RepoListProps) {
  if (isLoading) {
    return (
      <>
        {/* Desktop Loading */}
        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle>Repositories with Actions</CardTitle>
            <CardDescription>Loading your repositories...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
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
        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle>Repositories with Actions</CardTitle>
            <CardDescription>
              No repositories found with GitHub Actions enabled
            </CardDescription>
          </CardHeader>
        </Card>

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
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Repositories with Actions</CardTitle>
          <CardDescription>
            {repositories.length}{" "}
            {repositories.length === 1 ? "repository" : "repositories"} with
            GitHub Actions enabled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] sm:h-[500px] lg:h-[600px] pr-2 sm:pr-4">
            <div className="space-y-3 sm:space-y-4">
              {repositories.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200 hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          {repo.owner.type === "Organization" ? (
                            <Building className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                          ) : (
                            <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                          )}
                          <span className="text-base sm:text-lg font-semibold group-hover:text-primary transition-colors">
                            {repo.full_name}
                          </span>
                        </div>

                        {repo.private && (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        )}

                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground flex-wrap">
                        {repo.language && (
                          <div className="flex items-center gap-1">
                            <div className="h-3 w-3 rounded-full bg-blue-500" />
                            {repo.language}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {repo.stargazers_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          Updated {formatRelativeTime(repo.updated_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Mobile Version */}
      <div className="md:hidden flex flex-col h-full">
        <div className="px-4 py-3 border-b">
          <h2 className="text-lg font-bold">Repositories</h2>
          <p className="text-xs text-muted-foreground">
            {repositories.length}{" "}
            {repositories.length === 1 ? "repository" : "repositories"} with
            Actions
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-4 py-3 space-y-3">
            {repositories.map((repo) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-card rounded-lg border p-3 active:bg-accent/50 transition-colors space-y-2"
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

                <div className="flex items-center gap-3 text-xs text-muted-foreground pl-6 flex-wrap">
                  {repo.language && (
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
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
              </a>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
