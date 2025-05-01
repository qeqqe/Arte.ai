'use client';

import React, { createContext, useContext, useState } from 'react';

type ViewType = 'dashboard' | 'job-analysis' | 'my-data' | 'profile';

interface DashboardContextType {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');

  return (
    <DashboardContext.Provider value={{ activeView, setActiveView }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);

  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }

  return context;
}
