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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center px-6 py-16 text-center max-w-5xl">
        {/* Logo/Icon */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/20">
          <Github className="h-16 w-16 text-white" />
        </div>

        {/* Hero text */}
        <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight">
          GitHub Actions
          <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mt-2">
            Monitor
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl leading-relaxed">
          Monitor all your repositories and workflow runs in one beautiful
          dashboard. Real-time updates, comprehensive insights, stunning design.
        </p>

        {/* CTA */}
        <div className="mb-16 flex flex-col gap-4 w-full max-w-sm">
          <GitHubLoginButton />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-950 px-2 text-gray-500">
                Or sign in with
              </span>
            </div>
          </div>
          <PasskeyLoginButton />
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
          <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group">
            <div className="mb-4 p-3 rounded-lg bg-purple-500/20 w-fit">
              <Activity className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Real-time Monitoring
            </h3>
            <p className="text-gray-400 text-sm">
              Watch your workflows run in real-time with automatic updates every
              10 seconds
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group">
            <div className="mb-4 p-3 rounded-lg bg-blue-500/20 w-fit">
              <Zap className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Instant Insights
            </h3>
            <p className="text-gray-400 text-sm">
              Get immediate visibility into all repositories with GitHub Actions
              enabled
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group">
            <div className="mb-4 p-3 rounded-lg bg-pink-500/20 w-fit">
              <BarChart3 className="h-6 w-6 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Success Analytics
            </h3>
            <p className="text-gray-400 text-sm">
              Track success rates, failure patterns, and workflow performance
              metrics
            </p>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
