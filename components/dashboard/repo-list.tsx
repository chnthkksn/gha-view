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
      <Card>
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
    );
  }

  if (repositories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Repositories with Actions</CardTitle>
          <CardDescription>
            No repositories found with GitHub Actions enabled
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repositories with Actions</CardTitle>
        <CardDescription>
          {repositories.length}{" "}
          {repositories.length === 1 ? "repository" : "repositories"} with
          GitHub Actions enabled
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {repositories.map((repo) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200 hover:shadow-md cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        {repo.owner.type === "Organization" ? (
                          <Building className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {repo.full_name}
                        </span>
                      </div>

                      {repo.private && (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}

                      <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
  );
}
