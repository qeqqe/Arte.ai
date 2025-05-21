'use client';

import * as React from 'react';
import { DashboardContent } from '@/app/components/dashboard/dashboard-content';
import { DashboardSidebar } from '@/app/components/dashboard/dashboard-sidebar';
import { DashboardProvider } from '@/app/components/dashboard/dashboard-context';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuthGuard } from '@/hooks/use-auth-guard';

export default function DashboardPage() {
  // Redirect to login if not authenticated
  useAuthGuard();

  // Handle SSR
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Render a simple loading state during SSR
  if (!isClient) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <SidebarProvider>
      <DashboardProvider>
        <div className="flex h-screen w-screen overflow-hidden">
          <DashboardSidebar />
          <DashboardContent />
        </div>
      </DashboardProvider>
    </SidebarProvider>
  );
}
