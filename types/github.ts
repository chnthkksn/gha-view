// GitHub API Types

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  updated_at: string;
  pushed_at: string;
  language: string | null;
  stargazers_count: number;
  has_actions?: boolean;
  owner: {
    login: string;
    avatar_url: string;
    type?: string;
  };
}

export interface GitHubWorkflowRun {
  id: number;
  name: string;
  head_branch: string;
  head_sha: string;
  status: "queued" | "in_progress" | "completed";
  conclusion:
    | "success"
    | "failure"
    | "neutral"
    | "cancelled"
    | "skipped"
    | "timed_out"
    | "action_required"
    | null;
  workflow_id: number;
  html_url: string;
  created_at: string;
  updated_at: string;
  run_started_at: string;
  run_number: number;
  event: string;
  repository: {
    name: string;
    full_name: string;
  };
  head_commit: {
    message: string;
    author: {
      name: string;
      email: string;
    };
  };
  actor: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubWorkflow {
  id: number;
  name: string;
  path: string;
  state:
    | "active"
    | "deleted"
    | "disabled_fork"
    | "disabled_inactivity"
    | "disabled_manually";
  created_at: string;
  updated_at: string;
  html_url: string;
  badge_url: string;
}

export interface WorkflowRunsResponse {
  total_count: number;
  workflow_runs: GitHubWorkflowRun[];
}

export interface RepositoriesResponse {
  total_count: number;
  repositories: GitHubRepository[];
}

export type WorkflowStatus = "all" | "queued" | "in_progress" | "completed";
export type WorkflowConclusion =
  | "all"
  | "success"
  | "failure"
  | "cancelled"
  | "skipped";

export interface WorkflowStats {
  totalRepos: number;
  runningWorkflows: number;
  successRate: number;
  failureRate: number;
  totalRuns: number;
  avgDuration: number; // in seconds
  activeRunsLast24h: number;
}
