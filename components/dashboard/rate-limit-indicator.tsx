"use client";

import { useRateLimit, type RateLimitData } from "@/hooks/use-rate-limit";
import { AlertCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

// CountdownTimer component remains the same... (omitting here, will use specific targeting)
function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("0s");
        return;
      }

      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      const hours = Math.floor(diff / (1000 * 60 * 60));

      const parts = [];
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setTimeLeft(parts.join(" "));
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return <span>{timeLeft}</span>;
}

export function RateLimitIndicator() {
  const { data, isLoading } = useRateLimit();

  if (isLoading || !data) {
    return null;
  }

  const { core } = data.resources;
  const resetDate = new Date(core.reset * 1000);
  const percentageUsed = (core.used / core.limit) * 100;
  const isLow = core.remaining < 100;
  const isExhausted = core.remaining === 0;

  // Don't show if we have plenty of requests left
  if (!isLow && !isExhausted) {
    return null;
  }

  return (
    <div
      className={`w-full mb-6 rounded-xl border shadow-sm overflow-hidden flex flex-col md:flex-row ${
        isExhausted
          ? "bg-red-50/40 border-red-100 dark:bg-red-950/10 dark:border-red-900/30"
          : "bg-yellow-50/40 border-yellow-100 dark:bg-yellow-950/10 dark:border-yellow-900/30"
      }`}
    >
      {/* Left Main Content */}
      <div className="flex-1 p-4 md:p-5 flex items-start gap-4">
        <div
          className={`p-2.5 rounded-full shrink-0 ${
            isExhausted
              ? "bg-red-100 text-red-600 dark:bg-red-900/40"
              : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40"
          }`}
        >
          <AlertCircle className="h-6 w-6" />
        </div>

        <div>
          <h3
            className={`text-lg font-bold ${
              isExhausted
                ? "text-red-900 dark:text-red-100"
                : "text-yellow-900 dark:text-yellow-100"
            }`}
          >
            {isExhausted ? "API Rate Limit Exhausted" : "Low API Rate Limit"}
          </h3>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed max-w-xl">
            {isExhausted
              ? "GitHub API requests are currently paused. The dashboard is serving cached data until your limit resets."
              : "You are approaching the GitHub API rate limit. Aggressive caching has been enabled to preserve your remaining requests."}
          </p>
        </div>
      </div>

      {/* Right Stats Panel - styled as a distinct "sidebar" on desktop */}
      <div
        className={`p-4 md:p-5 md:w-72 md:border-l flex flex-col justify-center gap-4 ${
          isExhausted
            ? "bg-red-100/30 border-red-100 dark:bg-red-950/20 dark:border-red-900/30"
            : "bg-yellow-100/30 border-yellow-100 dark:bg-yellow-950/20 dark:border-yellow-900/30"
        }`}
      >
        {/* Key Metrics Row */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Used
            </p>
            <p
              className={`text-2xl font-black ${
                isExhausted ? "text-red-600" : "text-yellow-600"
              }`}
            >
              {percentageUsed.toFixed(0)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Remaining
            </p>
            <p className="text-2xl font-bold text-foreground">
              {core.remaining.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Improved Progress Bar */}
        <div className="h-2.5 w-full bg-background/80 rounded-full overflow-hidden shadow-inner ring-1 ring-black/5 dark:ring-white/5">
          <div
            className={`h-full transition-all duration-700 rounded-full ${
              isExhausted
                ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                : "bg-yellow-500"
            }`}
            style={{ width: `${percentageUsed}%` }}
          />
        </div>

        {/* Reset Timer Badge */}
        <div
          className={`flex items-center justify-center gap-2 p-2 rounded-lg text-sm font-medium ${
            isExhausted
              ? "bg-red-200/50 text-red-800 dark:bg-red-900/40 dark:text-red-200"
              : "bg-yellow-200/50 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200"
          }`}
        >
          <Clock className="h-4 w-4" />
          <div className="flex flex-col items-center leading-none gap-0.5">
            <span className="font-bold">
              {resetDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
            <span className="text-[10px] opacity-80 uppercase tracking-wide">
              Resets in <CountdownTimer targetDate={resetDate} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
