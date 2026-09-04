"use client";

import { useRateLimit } from "@/hooks/use-rate-limit";
import { AlertCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

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

  const tone = isExhausted ? "destructive" : "warning";

  return (
    <div
      className={cn(
        "w-full mb-6 rounded-lg border overflow-hidden flex flex-col md:flex-row bg-card",
        tone === "destructive" ? "border-destructive/25" : "border-warning/25"
      )}
    >
      {/* Left Main Content */}
      <div className="flex-1 p-4 md:p-5 flex items-start gap-4">
        <div
          className={cn(
            "p-2.5 rounded-full shrink-0",
            tone === "destructive"
              ? "bg-destructive/10 text-destructive"
              : "bg-warning/10 text-warning"
          )}
        >
          <AlertCircle className="h-6 w-6" />
        </div>

        <div>
          <h3
            className={cn(
              "text-base font-bold",
              tone === "destructive" ? "text-destructive" : "text-warning"
            )}
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

      {/* Right Stats Panel */}
      <div
        className={cn(
          "p-4 md:p-5 md:w-72 md:border-l border-t md:border-t-0 flex flex-col justify-center gap-4 bg-[#0F1216]",
          tone === "destructive" ? "border-destructive/20" : "border-warning/20"
        )}
      >
        {/* Key Metrics Row */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Used
            </p>
            <p
              className={cn(
                "text-2xl font-bold",
                tone === "destructive" ? "text-destructive" : "text-warning"
              )}
            >
              {percentageUsed.toFixed(0)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Remaining
            </p>
            <p className="text-2xl font-bold text-foreground">
              {core.remaining.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-700 rounded-full",
              tone === "destructive" ? "bg-destructive" : "bg-warning"
            )}
            style={{ width: `${percentageUsed}%` }}
          />
        </div>

        {/* Reset Timer */}
        <div
          className={cn(
            "flex items-center justify-center gap-2 p-2 rounded-md text-sm font-medium border",
            tone === "destructive"
              ? "bg-destructive/10 text-destructive border-destructive/20"
              : "bg-warning/10 text-warning border-warning/20"
          )}
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
