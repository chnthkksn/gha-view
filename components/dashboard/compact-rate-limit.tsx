"use client";

import { useRateLimit } from "@/hooks/use-rate-limit";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function CompactRateLimit() {
  const { data } = useRateLimit();

  if (!data) return null;

  const { core } = data.resources;
  const percentageUsed = (core.used / core.limit) * 100;
  const isExhausted = core.remaining === 0;
  const resetDate = new Date(core.reset * 1000);

  let tone: "primary" | "warning" | "destructive" = "primary";
  let Icon = CheckCircle2;

  if (percentageUsed > 75) {
    tone = "warning";
    Icon = AlertCircle;
  }

  if (percentageUsed > 90 || isExhausted) {
    tone = "destructive";
    Icon = AlertCircle;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs cursor-help",
            tone === "primary" && "text-primary",
            tone === "warning" && "text-warning",
            tone === "destructive" && "text-destructive"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          <span>api {percentageUsed.toFixed(0)}%</span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">API Rate Limit</h4>
            <span
              className={cn(
                "text-xs font-mono px-2 py-0.5 rounded-full",
                isExhausted
                  ? "bg-destructive/15 text-destructive"
                  : "bg-muted"
              )}
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
                className={cn(
                  "h-full transition-all duration-500 rounded-full",
                  tone === "primary" && "bg-primary",
                  tone === "warning" && "bg-warning",
                  tone === "destructive" && "bg-destructive"
                )}
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
