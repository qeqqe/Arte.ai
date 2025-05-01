import { DashboardContent } from '@/app/components/dashboard/dashboard-content';
import { DashboardSidebar } from '@/app/components/dashboard/dashboard-sidebar';
import { DashboardProvider } from '@/app/components/dashboard/dashboard-context';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function DashboardPage() {
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
