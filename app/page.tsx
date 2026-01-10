"use client";

import { useSession } from "@/lib/auth-client";
import { PasskeyLoginButton } from "@/components/auth/passkey-login-button";
import { GitHubLoginButton } from "@/components/auth/github-login-button";
import { Github, Activity, Zap, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 relative overflow-hidden">
      <main className="relative z-10 flex flex-col items-center justify-center px-6 py-16 text-center max-w-5xl">
        {/* Logo/Icon */}
        <div className="mb-8 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <Github className="h-12 w-12 text-white" />
        </div>

        {/* Hero text */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
          GHA View
        </h1>

        <p className="text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
          Exploring individual repositories to check status is a waste of time.
          <br />
          Get a single, auto-refreshing view of your entire CI/CD pipeline.
        </p>

        {/* CTA */}
        <div className="mb-16 flex flex-col gap-4 w-full max-w-sm">
          <GitHubLoginButton />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-950 px-2 text-slate-600">
                Or sign in with
              </span>
            </div>
          </div>
          <PasskeyLoginButton />
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="mb-4 text-purple-400">
              <Activity className="h-6 w-6 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Unified View
            </h3>
            <p className="text-slate-500 text-sm">
              Stop checking 20 different repos. See every running workflow in
              one list.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="mb-4 text-blue-400">
              <Zap className="h-6 w-6 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Auto-Refresh
            </h3>
            <p className="text-slate-500 text-sm">
              Dashboard automatically updates so you can keep it on a second
              monitor.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="mb-4 text-pink-400">
              <BarChart3 className="h-6 w-6 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Focus</h3>
            <p className="text-slate-500 text-sm">
              Filter by user, branch, or status to find exactly what broke (and
              who broke it).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <a
            href="https://github.com/chnthkksn/gha-view"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-white transition-colors"
          >
            <Github className="h-4 w-4" />
            <span>Star on GitHub</span>
          </a>
        </div>
      </main>
    </div>
  );
}
