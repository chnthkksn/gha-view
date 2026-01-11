"use client";

import { RefreshCw, Clock } from "lucide-react";
import { formatTime } from "@/lib/utils/github-helpers";

interface MobileStatusBarProps {
  lastUpdated: number;
  isRefreshing: boolean;
}

export function MobileStatusBar({
  lastUpdated,
  isRefreshing,
}: MobileStatusBarProps) {
  return (
    <div className="md:hidden sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          {isRefreshing ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
          ) : (
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className="text-muted-foreground">
            {lastUpdated > 0
              ? `Updated ${formatTime(lastUpdated)}`
              : "Not updated"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-primary">
          <span>Pull to refresh</span>
        </div>
      </div>
    </div>
  );
}
