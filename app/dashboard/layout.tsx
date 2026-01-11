"use client";

import { ReactNode } from "react";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { DashboardProvider } from "@/contexts/dashboard-context";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardProvider value={{}}>
      {children}

      {/* Mobile Navigation - available on all dashboard pages */}
      <MobileNav />
    </DashboardProvider>
  );
}
