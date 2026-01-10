import { Octokit } from "octokit";
import type {
  GitHubRepository,
  GitHubWorkflowRun,
  GitHubWorkflow,
  WorkflowRunsResponse,
} from "@/types/github";

export class GitHubClient {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  /**
   * Get all repositories the user has access to
   */
  async getRepositories(params?: {
    type?: "all" | "owner" | "public" | "private" | "member";
    sort?: "created" | "updated" | "pushed" | "full_name";
    per_page?: number;
    page?: number;
  }): Promise<GitHubRepository[]> {
    const response = await this.octokit.rest.repos.listForAuthenticatedUser({
      type: params?.type || "all",
      sort: params?.sort || "updated",
      per_page: params?.per_page || 100,
      page: params?.page || 1,
    });

    return response.data as unknown as GitHubRepository[];
  }

  /**
   * Get repositories that have GitHub Actions enabled
   * Uses GraphQL to check for .github/workflows directory in a single request
   * Fetches both personal/affiliated repos AND explicit organization repos
   */
  async getRepositoriesWithActions(): Promise<GitHubRepository[]> {
    try {
      let allNodes: any[] = [];
      let hasNextPage = true;
      let endCursor: string | null = null;
      let pageCount = 0;
      const MAX_PAGES = 3; // Fetch up to 300 repos to be safe

      while (hasNextPage && pageCount < MAX_PAGES) {
        // Query to get personal repos AND explicit organization repos
        const query = `
          query($cursor: String) {
            viewer {
              login
              # Strategy A: Main list of affiliated repos
              repositories(
                first: 100, 
                after: $cursor,
                orderBy: {field: UPDATED_AT, direction: DESC}, 
                ownerAffiliations: [OWNER, ORGANIZATION_MEMBER, COLLABORATOR]
              ) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  ...RepoFragment
                }
              }
              # Strategy B: Explicitly check organizations (only on first page to save complexity)
              organizations(first: 20) {
                nodes {
                  repositories(first: 20, orderBy: {field: UPDATED_AT, direction: DESC}) {
                    nodes {
                      ...RepoFragment
                    }
                  }
                }
              }
            }
          }
          
          fragment RepoFragment on Repository {
            databaseId
            name
            description
            url
            updatedAt
            pushedAt
            isPrivate
            stargazerCount
            owner {
              login
              avatarUrl
              __typename
            }
            hasWorkflows: object(expression: "HEAD:.github/workflows") {
              ... on Tree {
                entries {
                  name
                }
              }
            }
          }
        `;

        const response: any = await this.octokit.graphql(query, {
          cursor: endCursor,
        });

        const viewerRepos = response?.viewer?.repositories?.nodes || [];
        allNodes = [...allNodes, ...viewerRepos];

        // Add org repos only on the first pass
        if (pageCount === 0 && response?.viewer?.organizations?.nodes) {
          response.viewer.organizations.nodes.forEach((org: any) => {
            if (org.repositories?.nodes) {
              allNodes = [...allNodes, ...org.repositories.nodes];
            }
          });
        }

        const pageInfo = response?.viewer?.repositories?.pageInfo;
        hasNextPage = pageInfo?.hasNextPage;
        endCursor = pageInfo?.endCursor;
        pageCount++;
      }

      // Deduplicate by ID to handle overlaps between viewer.repositories and organizations
      const uniqueNodes = Array.from(
        new Map(allNodes.map((item) => [item.databaseId, item])).values()
      );

      // Filter repos that have the .github/workflows folder
      const validRepos = uniqueNodes.filter((repo: any) => !!repo.hasWorkflows);

      // Sort by updated_at descending to ensure mixed sources (user vs org) are interleaved correctly
      validRepos.sort(
        (a: any, b: any) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      // Map GraphQL response to our GitHubRepository type
      return validRepos.map((repo: any) => ({
        id: repo.databaseId,
        name: repo.name,
        full_name: `${repo.owner.login}/${repo.name}`,
        description: repo.description,
        private: repo.isPrivate,
        html_url: repo.url,
        updated_at: repo.updatedAt,
        pushed_at: repo.pushedAt,
        language: null,
        stargazers_count: repo.stargazerCount,
        has_actions: true,
        owner: {
          login: repo.owner.login,
          avatar_url: repo.owner.avatarUrl,
          type: repo.owner.__typename,
        },
      }));
    } catch (error) {
      console.error(
        "GraphQL optimization failed, falling back to REST:",
        error
      );
      return this.getRepositoriesWithActionsREST();
    }
  }

  /**
   * Fallback REST implementation (Original N+1 logic but optimized with batching)
   */
  async getRepositoriesWithActionsREST(): Promise<GitHubRepository[]> {
    // Get fewer repos to reduce API calls
    const repos = await this.getRepositories({
      sort: "updated",
      per_page: 20, // Reduced from 50 to avoid rate limits
    });

    const reposWithActions: GitHubRepository[] = [];

    // Process repos sequentially in small batches to avoid rate limits
    const batchSize = 3;
    for (let i = 0; i < repos.length; i += batchSize) {
      const batch = repos.slice(i, i + batchSize);

      const results = await Promise.all(
        batch.map(async (repo) => {
          try {
            const workflows = await this.getWorkflows(
              repo.owner.login,
              repo.name
            );

            if (workflows.length > 0) {
              return { ...repo, has_actions: true as const };
            }
            return null;
          } catch (error: any) {
            // Log rate limit errors but continue
            if (error?.status === 403) {
              console.warn(`Rate limited for ${repo.full_name}`);
            }
            return null;
          }
        })
      );

      reposWithActions.push(
        ...results.filter(
          (repo): repo is GitHubRepository & { has_actions: true } =>
            repo !== null
        )
      );

      // Add a small delay between batches to avoid rate limits
      if (i + batchSize < repos.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return reposWithActions;
  }

  /**
   * Get workflows for a specific repository
   */
  async getWorkflows(owner: string, repo: string): Promise<GitHubWorkflow[]> {
    try {
      const response = await this.octokit.rest.actions.listRepoWorkflows({
        owner,
        repo,
      });
      return response.data.workflows as unknown as GitHubWorkflow[];
    } catch {
      return [];
    }
  }

  /**
   * Get workflow runs for a specific repository
   */
  async getWorkflowRuns(
    owner: string,
    repo: string,
    params?: {
      status?: "queued" | "in_progress" | "completed";
      per_page?: number;
      page?: number;
    }
  ): Promise<WorkflowRunsResponse> {
    const response = await this.octokit.rest.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      status: params?.status,
      per_page: params?.per_page || 30,
      page: params?.page || 1,
    });

    return response.data as unknown as WorkflowRunsResponse;
  }

  /**
   * Get all workflow runs across all repositories with Actions
   */
  async getAllWorkflowRuns(params?: {
    status?: "queued" | "in_progress" | "completed";
    limit?: number;
  }): Promise<GitHubWorkflowRun[]> {
    // This now uses the optimized GraphQL fetching for the repo list!
    const repos = await this.getRepositoriesWithActions();
    const allRuns: GitHubWorkflowRun[] = [];

    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < repos.length; i += batchSize) {
      const batch = repos.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (repo) => {
          try {
            const { workflow_runs } = await this.getWorkflowRuns(
              repo.owner.login,
              repo.name,
              {
                status: params?.status,
                per_page: 5, // Just get recent few
              }
            );
            allRuns.push(...workflow_runs);
          } catch (error) {
            console.error(`Error fetching runs for ${repo.full_name}:`, error);
          }
        })
      );
    }

    // Sort by most recent first
    allRuns.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return params?.limit ? allRuns.slice(0, params.limit) : allRuns;
  }

  /**
   * Get currently running workflow runs
   */
  async getRunningWorkflows(): Promise<GitHubWorkflowRun[]> {
    return this.getAllWorkflowRuns({ status: "in_progress" });
  }

  /**
   * Get authenticated user info
   */
  async getUser() {
    const response = await this.octokit.rest.users.getAuthenticated();
    return response.data;
  }
}

/**
 * Create a GitHub client instance with the user's access token
 */
export function createGitHubClient(accessToken: string): GitHubClient {
  return new GitHubClient(accessToken);
}
