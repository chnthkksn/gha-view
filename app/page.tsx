"use client";

import { useSession } from "@/lib/auth-client";
import { PasskeyLoginButton } from "@/components/auth/passkey-login-button";
import { GitHubLoginButton } from "@/components/auth/github-login-button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const PREVIEW_ROWS = [
  { status: "success", workflow: "CI", repo: "acme/web-app", time: "2m ago" },
  {
    status: "in_progress",
    workflow: "Deploy / prod",
    repo: "acme/api-gateway",
    time: "now",
  },
  {
    status: "success",
    workflow: "Tests",
    repo: "acme/design-system",
    time: "6m ago",
  },
  {
    status: "failure",
    workflow: "Build",
    repo: "acme/ml-training",
    time: "9m ago",
  },
  {
    status: "success",
    workflow: "Security Scan",
    repo: "acme/search-index",
    time: "14m ago",
  },
];

const STATUS_COLOR: Record<string, string> = {
  success: "bg-primary",
  in_progress: "bg-warning",
  failure: "bg-destructive",
};

const FEATURES = [
  {
    title: "Unified view",
    description: "Every running workflow across every repo, one list.",
  },
  {
    title: "Auto-refresh",
    description: "Leave it running on a second monitor. It stays current.",
  },
  {
    title: "Focus",
    description: "Filter by user, branch, or status to find what broke.",
  },
];

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-sm text-muted-foreground">
          loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-16 px-5">
      <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-6">
        <span className="text-primary-foreground font-extrabold text-xl">
          gh
        </span>
      </div>

      <h1 className="text-4xl md:text-[44px] font-extrabold tracking-tight mb-3">
        gha-view
      </h1>
      <p className="text-muted-foreground text-[15px] max-w-[480px] text-center leading-relaxed mb-10">
        Checking Actions status across a dozen repos, one tab at a time,
        wastes your morning. One auto-refreshing view of every workflow,
        everywhere.
      </p>

      <div className="w-full max-w-xl bg-card border border-border rounded-xl overflow-hidden mb-10 shadow-2xl">
        <div className="px-3.5 py-2.5 border-b border-border flex items-center gap-2 bg-[#0F1216]">
          <span className="w-[9px] h-[9px] rounded-full bg-destructive" />
          <span className="w-[9px] h-[9px] rounded-full bg-warning" />
          <span className="w-[9px] h-[9px] rounded-full bg-primary" />
          <span className="ml-2 text-muted-foreground/70 text-[11px]">
            workflow runs
          </span>
        </div>
        <div className="py-1.5">
          {PREVIEW_ROWS.map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-4 py-2 text-xs border-b border-white/[0.04] last:border-b-0"
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  STATUS_COLOR[row.status],
                  row.status === "in_progress" && "animate-pulse"
                )}
              />
              <span className="font-medium flex-1 text-left">
                {row.workflow}
              </span>
              <span className="text-muted-foreground/70">{row.repo}</span>
              <span className="text-muted-foreground/70 w-[60px] text-right">
                {row.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-[320px] mb-14">
        <GitHubLoginButton />
        <div className="flex items-center gap-2.5 text-muted-foreground/70 text-[11px]">
          <span className="flex-1 h-px bg-border" />
          or
          <span className="flex-1 h-px bg-border" />
        </div>
        <PasskeyLoginButton />
      </div>

      <div className="grid gap-3.5 w-full max-w-[760px] grid-cols-1 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="bg-card border border-border rounded-lg p-5"
          >
            <div className="font-bold text-[13px] mb-1.5">
              {feature.title}
            </div>
            <div className="text-muted-foreground/70 text-xs leading-relaxed">
              {feature.description}
            </div>
          </div>
        ))}
      </div>

      <a
        href="https://github.com/chnthkksn/gha-view"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-14 text-muted-foreground/70 hover:text-foreground text-xs flex items-center gap-1.5 transition-colors"
      >
        ★ Star on GitHub
      </a>
    </div>
  );
}
