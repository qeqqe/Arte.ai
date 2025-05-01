'use client';

import {
  LayoutDashboard,
  BriefcaseBusiness,
  BarChart3,
  Settings,
  LogOut,
  UserCircle,
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
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useDashboard } from './dashboard-context';

export function DashboardSidebar() {
  const { activeView, setActiveView } = useDashboard();

  return (
    <Sidebar className="h-full border-r border-rose-100 w-[260px] lg:w-64 md:w-[220px] sm:min-w-[70px] transition-all duration-200 flex-shrink-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-400 to-rose-600"></div>
            <div className="absolute inset-0.5 rounded-full bg-white flex items-center justify-center text-rose-600 font-bold text-sm">
              A
            </div>
          </div>
          <div className="font-semibold text-xl tracking-tight sm:hidden md:block">
            Arte.ai
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
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
                  <span className="sm:hidden md:inline">Dashboard</span>
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
                  <span className="sm:hidden md:inline">Job Analysis</span>
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
                  <span className="sm:hidden md:inline">My Data</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel className="sm:sr-only md:not-sr-only">
            Profile
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === 'profile'}
                  tooltip="My Profile"
                  onClick={() => setActiveView('profile')}
                >
                  <UserCircle
                    className={activeView === 'profile' ? 'text-rose-500' : ''}
                  />
                  <span className="sm:hidden md:inline">My Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-2 rounded-lg p-2 hover:bg-rose-50 transition-colors">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback className="bg-rose-100 text-rose-700">
              JD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 sm:hidden md:block">
            <p className="text-sm font-medium truncate">Jane Doe</p>
            <p className="text-xs text-muted-foreground truncate">
              jane.doe@example.com
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-rose-500 sm:hidden md:flex"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
