"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CompactRateLimit } from "@/components/dashboard/compact-rate-limit";
import { formatTime } from "@/lib/utils/github-helpers";
import { Github, LogOut, RefreshCw, User, Shield, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { AutoRefreshToggle } from "@/components/dashboard/auto-refresh-toggle";

interface DashboardHeaderProps {
  lastUpdated: number;
  isRefreshing: boolean;
  isAutoRefreshEnabled: boolean;
  onRefresh: () => void;
  onAutoRefreshToggle: (enabled: boolean) => void;
}

export function DashboardHeader({
  lastUpdated,
  isRefreshing,
  isAutoRefreshEnabled,
  onRefresh,
  onAutoRefreshToggle,
}: DashboardHeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (!session?.user) return null;

  return (
    <header className="hidden md:block sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-3 sm:px-4 md:px-6 flex h-14 sm:h-16 items-center justify-between max-w-[2000px] mx-auto">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
            <Github className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              GHA View
            </h1>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <p className="hidden md:inline">Live workflow monitoring</p>
              {lastUpdated > 0 && (
                <>
                  <span className="hidden md:inline">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="hidden sm:inline">Updated</span>{" "}
                    {formatTime(lastUpdated)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <div className="hidden md:block">
            <AutoRefreshToggle
              isEnabled={isAutoRefreshEnabled}
              onToggle={onAutoRefreshToggle}
            />
          </div>
          <div className="hidden md:block h-6 w-px bg-border" />
          {/* Separator */}
          <div className="hidden sm:block">
            <CompactRateLimit />
          </div>
          <ModeToggle />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 sm:h-10 sm:w-10"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem] ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span className="sr-only">Refresh</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full"
              >
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-primary/20 hover:border-primary transition-colors">
                  <AvatarImage
                    src={session.user.image || undefined}
                    alt={session.user.name || ""}
                  />
                  <AvatarFallback>
                    {session.user.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session.user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/profile")}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/security")}
                className="cursor-pointer"
              >
                <Shield className="mr-2 h-4 w-4" />
                <span>Security</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
                  window.open(
                    `https://github.com/settings/connections/applications/${clientId}`,
                    "_blank"
                  );
                }}
                className="cursor-pointer"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                <span>Manage Access</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-600 dark:text-red-400 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
