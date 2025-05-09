'use client';

import { DashboardContent } from '@/app/components/dashboard/dashboard-content';
import { DashboardSidebar } from '@/app/components/dashboard/dashboard-sidebar';
import { DashboardProvider } from '@/app/components/dashboard/dashboard-context';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuthGuard } from '@/hooks/use-auth-guard';

export default function DashboardPage() {
  // Redirect to login if not authenticated
  useAuthGuard();
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
