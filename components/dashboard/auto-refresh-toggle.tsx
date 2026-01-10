"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AutoRefreshToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function AutoRefreshToggle({
  isEnabled,
  onToggle,
}: AutoRefreshToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="auto-refresh"
        checked={isEnabled}
        onCheckedChange={onToggle}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Label
              htmlFor="auto-refresh"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-help"
            >
              Auto-refresh
            </Label>
          </TooltipTrigger>
          <TooltipContent>
            <p>Automatically refresh data every 60 seconds</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
