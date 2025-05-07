'use client';

import { Plus, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardView } from './views/dashboard-view';
import { JobAnalysisView } from './views/job-analysis-view';
import { MyDataView } from './views/my-data-view';
import { useDashboard } from './dashboard-context';

export function DashboardContent() {
  const { activeView } = useDashboard();

  const renderContent = () => {
    switch (activeView) {
      case 'job-analysis':
        return <JobAnalysisView />;
      case 'my-data':
        return <MyDataView />;
      case 'profile':
        return <div className="p-6">Profile content will go here</div>;
      default:
        return <DashboardView />;
    }
  };

  return (
    <SidebarInset className="flex-1 w-full">
      <div className="flex flex-col h-full w-full">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-rose-100 w-full">
          <div className="flex items-center justify-between p-2 sm:p-3 md:p-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors">
                <Menu className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />
                <span className="sr-only">Toggle sidebar</span>
              </SidebarTrigger>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
                {activeView === 'dashboard'
                  ? 'Dashboard'
                  : activeView === 'job-analysis'
                    ? 'Job Analysis'
                    : activeView === 'my-data'
                      ? 'My Data'
                      : 'Profile'}
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="relative w-32 sm:w-48 md:w-64 hidden sm:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search jobs or skills..."
                  className="pl-8 bg-white border-rose-100 focus-visible:ring-rose-400"
                />
              </div>
              {activeView === 'job-analysis' && (
                <Button className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-xs sm:text-sm whitespace-nowrap">
                  <Plus   className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Compare to New Job</span>
                  <span className="sm:hidden">Compare</span>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Fixed sidebar toggle button for small screens */}
        <button
          type="button"
          className="fixed bottom-4 left-4 z-50 lg:hidden md:hidden flex items-center justify-center p-2.5 rounded-full bg-rose-100 text-rose-600 shadow-md hover:bg-rose-200 transition-colors"
          onClick={() => {
            // Find and click the SidebarTrigger
            const sidebarTrigger = document.querySelector(
              '[data-slot="sidebar-trigger"]'
            );
            if (sidebarTrigger instanceof HTMLElement) {
              sidebarTrigger.click();
            }
          }}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Open sidebar</span>
        </button>

        <main className="flex-1 p-3 sm:p-4 md:p-6 w-full overflow-auto">
          {renderContent()}
        </main>
      </div>
    </SidebarInset>
  );
}
