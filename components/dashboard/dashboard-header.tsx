"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
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
import { AutoRefreshToggle } from "@/components/dashboard/auto-refresh-toggle";
import { useDashboard } from "@/contexts/dashboard-context";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "dashboard" },
  { href: "/dashboard/profile", label: "profile" },
  { href: "/dashboard/security", label: "security" },
];

export function DashboardHeader() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const {
    onRefresh,
    isRefreshing,
    isAutoRefreshEnabled,
    onAutoRefreshToggle,
    lastUpdated,
  } = useDashboard();

  const isDashboardHome = pathname === "/dashboard";

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (!session?.user) return null;

  return (
    <header className="hidden md:block sticky top-0 z-50 w-full bg-[#0F1216] border-b border-border">
      <div className="px-5 flex h-14 items-center gap-6 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-2.5 min-w-0 shrink-0">
          <div className="w-[26px] h-[26px] rounded-md bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-extrabold text-[13px]">
              gh
            </span>
          </div>
          <span className="font-bold text-[15px] tracking-tight">
            gha-view
          </span>
        </div>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-2.5 py-1.5 rounded-md text-xs transition-colors",
                  isActive
                    ? "bg-white/[0.06] text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4 ml-auto">
          {isDashboardHome && (
            <>
              {!!lastUpdated && lastUpdated > 0 && (
                <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Updated {formatTime(lastUpdated)}</span>
                </div>
              )}
              {onAutoRefreshToggle && (
                <AutoRefreshToggle
                  isEnabled={!!isAutoRefreshEnabled}
                  onToggle={onAutoRefreshToggle}
                />
              )}
              <div className="h-5 w-px bg-border" />
              <CompactRateLimit />
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  title="Refresh"
                  className="flex items-center justify-center h-[30px] w-[30px] rounded-md border border-white/10 text-foreground cursor-pointer disabled:opacity-50 hover:bg-white/[0.04] transition-colors"
                >
                  <RefreshCw
                    className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
                  />
                  <span className="sr-only">Refresh</span>
                </button>
              )}
              <a
                href="https://github.com/chnthkksn/gha-view"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xl:flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs"
              >
                ★ star
              </a>
              <div className="h-5 w-px bg-border" />
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative h-7 w-7 rounded-full cursor-pointer">
                <Avatar className="h-7 w-7 border border-white/10">
                  <AvatarImage
                    src={session.user.image || undefined}
                    alt={session.user.name || ""}
                  />
                  <AvatarFallback className="bg-[#1B1F26] text-muted-foreground text-[11px] font-semibold">
                    {session.user.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </button>
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
                <Github className="mr-2 h-4 w-4" />
                <span>Manage Access</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                variant="destructive"
                className="cursor-pointer"
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
