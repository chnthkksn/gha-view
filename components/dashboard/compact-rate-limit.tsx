"use client";

import { useRateLimit } from "@/hooks/use-rate-limit";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useEffect, useState } from "react";

export function CompactRateLimit() {
  const { data } = useRateLimit();

  if (!data) return null;

  const { core } = data.resources;
  const percentageUsed = (core.used / core.limit) * 100;
  const isExhausted = core.remaining === 0;
  const resetDate = new Date(core.reset * 1000);

  let colorClass =
    "bg-green-100/50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
  let Icon = CheckCircle2;

  if (percentageUsed > 75) {
    colorClass =
      "bg-yellow-100/50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
    Icon = AlertCircle;
  }

  if (percentageUsed > 90 || isExhausted) {
    colorClass =
      "bg-red-100/50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    Icon = AlertCircle;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-help ${colorClass}`}
        >
          <Icon className="h-3.5 w-3.5" />
          <span>Rate limit: {percentageUsed.toFixed(0)}%</span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">API Rate Limit</h4>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                isExhausted
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30"
                  : "bg-muted"
              }`}
            >
              {core.remaining} / {core.limit}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Usage</span>
              <span>{percentageUsed.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isExhausted
                    ? "bg-red-500"
                    : percentageUsed > 75
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${percentageUsed}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs border-t pt-3">
            <span className="text-muted-foreground">Resets in</span>
            <div className="flex items-center gap-1 font-medium">
              <Clock className="h-3 w-3" />
              <CountdownTimer targetDate={resetDate} />
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

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

      // Only show minutes if useful context
      if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return <span>{timeLeft}</span>;
}
