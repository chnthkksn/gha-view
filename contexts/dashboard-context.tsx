"use client";

import { createContext, useContext, ReactNode, useState } from "react";

interface DashboardContextValue {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isAutoRefreshEnabled?: boolean;
  onAutoRefreshToggle?: (enabled: boolean) => void;
}

interface DashboardContextType {
  value: DashboardContextValue;
  setValue: (value: DashboardContextValue) => void;
}

const DashboardContext = createContext<DashboardContextType>({
  value: {},
  setValue: () => {},
});

export function useDashboard() {
  const context = useContext(DashboardContext);
  return context.value;
}

export function useSetDashboard() {
  const context = useContext(DashboardContext);
  return context.setValue;
}

interface DashboardProviderProps {
  children: ReactNode;
  value?: DashboardContextValue;
}

export function DashboardProvider({
  children,
  value: initialValue = {},
}: DashboardProviderProps) {
  const [value, setValue] = useState<DashboardContextValue>(initialValue);

  return (
    <DashboardContext.Provider value={{ value, setValue }}>
      {children}
    </DashboardContext.Provider>
  );
}
