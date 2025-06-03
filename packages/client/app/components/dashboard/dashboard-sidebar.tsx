'use client';

import {
  LayoutDashboard,
  BriefcaseBusiness,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useDashboard } from './dashboard-context';
import { useUserProfile } from '@/hooks/use-user-profile';

export function DashboardSidebar() {
  const { activeView, setActiveView } = useDashboard();
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile();

  return (
    <Sidebar className="h-full border-r border-rose-100 w-[260px] lg:w-64 md:w-[220px] sm:w-[200px] transition-all duration-200 flex-shrink-0 bg-white shadow-sm">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 px-6 py-[0.81rem] border-b border-slate-100 backdrop-blur">
          <div className="relative flex items-center">
            <img
              src="/Logo.svg"
              alt="Arte.ai Logo"
              className="h-9 w-9 object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/15 to-transparent rounded-lg mix-blend-overlay"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              Arte.ai
            </span>
            <span className="text-xs text-slate-500 font-medium -mt-0.5">
              Skill Gap Analyzer
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel className="sm:sr-only md:not-sr-only">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === 'dashboard'}
                  tooltip="Dashboard"
                  onClick={() => setActiveView('dashboard')}
                >
                  <LayoutDashboard
                    className={
                      activeView === 'dashboard' ? 'text-rose-500' : ''
                    }
                  />
                  <span className="sm:inline md:inline">Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === 'job-analysis'}
                  tooltip="Job Analysis"
                  onClick={() => setActiveView('job-analysis')}
                >
                  <BriefcaseBusiness
                    className={
                      activeView === 'job-analysis' ? 'text-rose-500' : ''
                    }
                  />
                  <span className="sm:inline md:inline">Job Analysis</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === 'my-data'}
                  tooltip="My Data"
                  onClick={() => setActiveView('my-data')}
                >
                  <BarChart3
                    className={activeView === 'my-data' ? 'text-rose-500' : ''}
                  />
                  <span className="sm:inline md:inline">My Data</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 bg-white border-t border-rose-100">
        <div className="flex items-center gap-2 rounded-lg p-2 hover:bg-rose-50 transition-colors bg-gradient-to-r from-rose-50/50 to-rose-100/20">
          <Avatar
            className={`h-8 w-8 flex-shrink-0 ${isLoadingProfile ? 'opacity-70' : ''}`}
          >
            {isLoadingProfile ? (
              <AvatarFallback className="bg-rose-100 text-rose-700 animate-pulse">
                <span className="opacity-0">U</span>
              </AvatarFallback>
            ) : (
              <>
                <AvatarImage
                  src={userProfile?.avatarUrl || ''}
                  alt={userProfile?.username || 'User'}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <AvatarFallback className="bg-rose-100 text-rose-700">
                  {userProfile?.username && userProfile.username.length > 0
                    ? userProfile.username.substring(0, 2).toUpperCase()
                    : 'U'}
                </AvatarFallback>
              </>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {isLoadingProfile ? (
                <span className="inline-block w-20 h-4 bg-rose-100 animate-pulse rounded"></span>
              ) : (
                userProfile?.username || 'User'
              )}
            </p>
            <p className="text-xs text-rose-500/70 truncate">GitHub User</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
            onClick={async () => {
              await fetch('api/dashboard/log-out', {
                credentials: 'include',
              });
              window.location.href = '/';
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
