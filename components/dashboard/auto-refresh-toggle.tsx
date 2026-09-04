"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AutoRefreshToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function AutoRefreshToggle({
  isEnabled,
  onToggle,
}: AutoRefreshToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onToggle(!isEnabled)}
            className="flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-muted-foreground text-xs cursor-pointer hover:bg-white/[0.04] transition-colors"
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                isEnabled ? "bg-primary" : "bg-muted-foreground"
              )}
            />
            auto-refresh {isEnabled ? "on" : "off"}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Automatically refresh data every 60 seconds</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
