"use client";

import { Home, Activity, Menu } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Shield, LogOut, RefreshCw, Github } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { AutoRefreshToggle } from "@/components/dashboard/auto-refresh-toggle";
import { CompactRateLimit } from "@/components/dashboard/compact-rate-limit";
import { useDashboard } from "@/contexts/dashboard-context";

export function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Get dashboard-specific features from context when on dashboard page
  const { onRefresh, isRefreshing, isAutoRefreshEnabled, onAutoRefreshToggle } =
    useDashboard();

  const handleHome = () => {
    if (pathname !== "/dashboard") {
      router.push("/dashboard");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWorkflows = () => {
    if (pathname !== "/dashboard") {
      router.push("/dashboard?scrollTo=workflows");
    } else {
      const workflowElement = document.getElementById("workflow-runs-mobile");
      if (workflowElement) {
        workflowElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="flex items-center justify-around h-16 px-4">
          <button
            onClick={handleHome}
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </button>

          <button
            onClick={handleWorkflows}
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Activity className="h-5 w-5" />
            <span className="text-xs">Workflow</span>
          </button>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Menu className="h-5 w-5" />
            <span className="text-xs">Menu</span>
          </button>
        </div>
      </nav>

      {/* Menu Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Menu</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-4 pb-8">
            {/* User Profile */}
            {session?.user && (
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session.user.image || undefined} />
                  <AvatarFallback>
                    {session.user.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {session.user.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  router.push("/dashboard/profile");
                  setIsDrawerOpen(false);
                }}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  router.push("/dashboard/security");
                  setIsDrawerOpen(false);
                }}
              >
                <Shield className="h-4 w-4 mr-2" />
                Security
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <a
                  href={`https://github.com/settings/connections/applications/${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4 mr-2" />
                  Manage Access
                </a>
              </Button>
            </div>

            {/* Settings */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Theme</span>
                <ModeToggle />
              </div>

              {onRefresh && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Refresh Data</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onRefresh();
                      setIsDrawerOpen(false);
                    }}
                    disabled={isRefreshing}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                  </Button>
                </div>
              )}

              {onAutoRefreshToggle && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Auto Refresh</span>
                  <AutoRefreshToggle
                    isEnabled={isAutoRefreshEnabled || false}
                    onToggle={onAutoRefreshToggle}
                  />
                </div>
              )}

              <CompactRateLimit />
            </div>

            {/* Sign Out */}
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
