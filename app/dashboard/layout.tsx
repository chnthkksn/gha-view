"use client";

import { ReactNode } from "react";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardProvider } from "@/contexts/dashboard-context";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardProvider value={{}}>
      {/* Desktop Header - shared across all dashboard pages */}
      <DashboardHeader />

      {children}

      {/* Mobile Navigation - available on all dashboard pages */}
      <MobileNav />
    </DashboardProvider>
  );
}
