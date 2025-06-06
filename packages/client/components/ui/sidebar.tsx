'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { VariantProps, cva } from 'class-variance-authority';
import { PanelLeftIcon } from 'lucide-react';

import { useIsMobile } from '@/hooks/use-mobile';
import { useUserProfile } from '@/hooks/use-user-profile';
import classNames from '@/utils/classnames';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

type SidebarContextProps = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }

  return context;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      if (typeof document !== 'undefined') {
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      }
    },
    [setOpenProp, open]
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? 'expanded' : 'collapsed';

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH,
              '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={classNames(
            'group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  const [activeView, setActiveView] = React.useState<string | null>(null);
  const userProfile = useUserProfile();
  React.useEffect(() => {
    const dashboardContext = document.querySelector(
      '[data-dashboard-context="true"]'
    );

    if (!dashboardContext) return;

    // Function to update our local state when the context changes
    const handleSetActiveView = (e: CustomEvent) => {
      if (e.detail && e.detail.view) {
        setActiveView(e.detail.view);
      }
    };

    // Listen for view change events from the context
    const handleViewChange = () => {
      const currentView = dashboardContext.getAttribute('data-active-view');
      if (currentView) {
        setActiveView(currentView);
      }
    };

    // Set up listeners for view updates
    dashboardContext.addEventListener(
      'setActiveView',
      handleSetActiveView as EventListener
    );
    dashboardContext.addEventListener('viewChange', handleViewChange);

    // Initial sync - check for an active view data attribute
    const initialView = dashboardContext.getAttribute('data-active-view');
    if (initialView) {
      setActiveView(initialView);
    }

    return () => {
      dashboardContext.removeEventListener(
        'setActiveView',
        handleSetActiveView as EventListener
      );
      dashboardContext.removeEventListener('viewChange', handleViewChange);
    };
  }, []);

  // Also listen for route changes from the dashboard context
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleViewChange = () => {
      // When viewChange event is detected, check the context element
      const dashboardContext = document.querySelector(
        '[data-dashboard-context="true"]'
      );
      if (dashboardContext) {
        const currentView = dashboardContext.getAttribute('data-active-view');
        if (currentView) {
          setActiveView(currentView);
        }
      }
    };

    // Listen for the custom viewChange event
    window.addEventListener('viewChange', handleViewChange);

    // Initial check for existing state
    const dashboardContext = document.querySelector(
      '[data-dashboard-context="true"]'
    );
    if (dashboardContext) {
      const currentView = dashboardContext.getAttribute('data-active-view');
      if (currentView) {
        setActiveView(currentView);
      }
    }

    return () => {
      window.removeEventListener('viewChange', handleViewChange);
    };
  }, []);

  if (collapsible === 'none') {
    return (
      <div
        data-slot="sidebar"
        className={classNames(
          'bg-white text-slate-800 flex h-full w-(--sidebar-width) flex-col border-r border-slate-200 shadow-xl',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-white text-slate-800 w-(--sidebar-width) p-0 [&>button]:hidden border-r border-slate-200"
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group peer text-slate-800 hidden md:block"
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={classNames(
          'relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear',
          'group-data-[collapsible=offcanvas]:w-0',
          'group-data-[side=right]:rotate-180',
          variant === 'floating' || variant === 'inset'
            ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
            : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)'
        )}
      />
      <div
        data-slot="sidebar-container"
        className={classNames(
          'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex',
          side === 'left'
            ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
            : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
          // Adjust the padding for floating and inset variants.
          variant === 'floating' || variant === 'inset'
            ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
            : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l border-slate-200',
          className
        )}
        style={{
          background: '#fff',
          boxShadow: '0 2px 24px 0 rgba(0,0,0,0.06)',
        }}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="flex h-full w-full flex-col"
          style={{ boxShadow: 'none' }}
        >
          {/* Sidebar Brand/Header */}
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
          {/* Main nav */}
          <nav className="flex-1 flex flex-col gap-4 px-3 py-6">
            <div className="px-3 mb-1">
              <h2 className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
                Navigation
              </h2>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={
                    activeView === 'dashboard' ||
                    (!activeView &&
                      (window?.location?.pathname === '/' ||
                        window?.location?.pathname === '/dashboard'))
                  }
                  variant="default"
                  className="relative group transition-all"
                  onClick={() => {
                    const dashboardContext = document.querySelector(
                      '[data-dashboard-context="true"]'
                    );
                    if (dashboardContext) {
                      dashboardContext.dispatchEvent(
                        new CustomEvent('setActiveView', {
                          detail: { view: 'dashboard' },
                        })
                      );
                      setActiveView('dashboard');
                    } else {
                      if (typeof window !== 'undefined') {
                        window.location.pathname = '/';
                      }
                    }
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2"
                  >
                    <path
                      d="M3 11L12 2L21 11V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V11Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 21V12H15V21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="font-semibold">Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={
                    activeView === 'job-analysis' ||
                    (!activeView &&
                      window?.location?.pathname === '/job-analysis')
                  }
                  variant="default"
                  className="relative group transition-all"
                  onClick={() => {
                    const dashboardContext = document.querySelector(
                      '[data-dashboard-context="true"]'
                    );
                    if (dashboardContext) {
                      dashboardContext.dispatchEvent(
                        new CustomEvent('setActiveView', {
                          detail: { view: 'job-analysis' },
                        })
                      );
                      setActiveView('job-analysis');
                    } else {
                      if (typeof window !== 'undefined') {
                        window.location.pathname = '/job-analysis';
                      }
                    }
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2"
                  >
                    <path
                      d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Job Analysis</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={
                    activeView === 'my-data' ||
                    (!activeView && window?.location?.pathname === '/my-data')
                  }
                  variant="default"
                  className="relative group transition-all"
                  onClick={() => {
                    const dashboardContext = document.querySelector(
                      '[data-dashboard-context="true"]'
                    );
                    if (dashboardContext) {
                      dashboardContext.dispatchEvent(
                        new CustomEvent('setActiveView', {
                          detail: { view: 'my-data' },
                        })
                      );
                      setActiveView('my-data');
                    } else {
                      if (typeof window !== 'undefined') {
                        window.location.pathname = '/my-data';
                      }
                    }
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2"
                  >
                    <path
                      d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3.27002 6.96L12 12.01L20.73 6.96"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 22.08V12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Data Sources</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </nav>
          {/* Footer */}
          <div className="mt-auto">
            <div className="mx-3 my-2 px-3 py-3 rounded-lg bg-gradient-to-r from-rose-500/5 to-rose-400/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-sm">
                    {userProfile?.data?.avatarUrl ? (
                      <img
                        src={userProfile?.data?.avatarUrl}
                        alt={`${userProfile?.data?.username}`}
                        width={54.5}
                        height={53.5}
                        className="rounded-full"
                      />
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700">
                      {userProfile?.data?.username || 'User'}
                    </span>
                    <span className="text-xs text-slate-500">GitHub</span>
                  </div>
                </div>
                <button
                  className="rounded-full p-1.5 text-rose-500 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                  onClick={async () => {
                    await fetch('api/dashboard/log-out', {
                      credentials: 'include',
                    });
                    window.location.href = '/';
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 17L21 12L16 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 12H9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-white/90">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  © {new Date().getFullYear()} Arte.ai
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={classNames(
        'size-8 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-all duration-200 shadow-sm',
        className
      )}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon className="size-5" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

function SidebarRail({ className, ...props }: React.ComponentProps<'button'>) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={classNames(
        'hover:after:bg-slate-600 absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex',
        'in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize',
        '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
        'hover:group-data-[collapsible=offcanvas]:bg-slate-900/20 group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full',
        '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
        '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
        className
      )}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<'main'>) {
  return (
    <main
      data-slot="sidebar-inset"
      className={classNames(
        'bg-background relative flex w-full flex-1 flex-col',
        'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
        className
      )}
      {...props}
    />
  );
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={classNames(
        'bg-slate-800/60 h-9 w-full text-slate-200 placeholder:text-slate-500 border-slate-700 focus-visible:ring-slate-700/50 focus-visible:border-slate-600 shadow-inner',
        className
      )}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={classNames('flex flex-col gap-3 sm:p-4', className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={classNames(
        'flex flex-col gap-3 p-3 sm:p-4 border-t border-slate-800/30 bg-slate-900/40 mt-auto',
        className
      )}
      {...props}
    />
  );
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={classNames('bg-slate-700/30 mx-3 w-auto', className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={classNames(
        'flex min-h-0 flex-1 flex-col gap-3 overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent p-1 pt-2 group-data-[collapsible=icon]:overflow-hidden',
        className
      )}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={classNames(
        'relative flex w-full min-w-0 flex-col p-2 sm:p-3 rounded-lg',
        className
      )}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'div'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={classNames(
        'text-slate-400 ring-slate-700 flex h-8 shrink-0 items-center rounded-md px-2 sm:px-3 text-xs font-medium uppercase tracking-wider outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
        className
      )}
      {...props}
    />
  );
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={classNames(
        'text-slate-400 ring-slate-700 hover:bg-slate-800 hover:text-slate-200 absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        // Increases the hit area of the button on mobile.
        'after:absolute after:-inset-2 md:after:hidden',
        'group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={classNames('w-full text-sm', className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={classNames('flex w-full min-w-0 flex-col gap-1.5', className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={classNames('group/menu-item relative', className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  'peer/menu-button flex w-full items-center gap-3 overflow-hidden rounded-lg p-3 text-left text-sm outline-hidden ring-rose-500 transition-all duration-200 focus-visible:ring-2 active:bg-rose-50 active:text-rose-700 disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-gradient-to-r data-[active=true]:from-rose-50 data-[active=true]:to-rose-50/30 data-[active=true]:font-medium data-[active=true]:text-rose-700 data-[state=open]:hover:bg-rose-50 data-[state=open]:hover:text-rose-700 group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-5 [&>svg]:shrink-0 shadow-sm',
  {
    variants: {
      variant: {
        default:
          'hover:bg-rose-50/50 hover:text-rose-600 border border-transparent hover:border-rose-200/50',
        outline:
          'bg-white shadow-sm hover:bg-rose-50/50 hover:text-rose-700 hover:shadow-md border border-rose-100/50',
      },
      size: {
        default: 'h-10 text-sm',
        sm: 'h-9 text-xs',
        lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0!',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = 'default',
  size = 'default',
  tooltip,
  className,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot : 'button';
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={classNames(
        sidebarMenuButtonVariants({ variant, size }),
        isActive
          ? 'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-[60%] before:w-1.5 before:rounded-r-full before:bg-gradient-to-b before:from-rose-500 before:to-rose-600 before:shadow-[0_0_10px_rgba(244,63,94,0.3)]'
          : '',
        className
      )}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  if (typeof tooltip === 'string') {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== 'collapsed' || isMobile}
        {...tooltip}
      />
    </Tooltip>
  );
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean;
  showOnHover?: boolean;
}) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={classNames(
        'text-slate-400 ring-slate-700 hover:bg-slate-800 hover:text-blue-300 peer-hover/menu-button:text-blue-300 absolute top-1.5 right-1 flex aspect-square w-6 items-center justify-center rounded-md p-0 outline-hidden transition-all focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        // Increases the hit area of the button on mobile.
        'after:absolute after:-inset-2 md:after:hidden',
        'peer-data-[size=sm]/menu-button:top-1',
        'peer-data-[size=default]/menu-button:top-1.5',
        'peer-data-[size=lg]/menu-button:top-2.5',
        'group-data-[collapsible=icon]:hidden',
        showOnHover &&
          'peer-data-[active=true]/menu-button:text-blue-300 group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0',
        className
      )}
      {...props}
    />
  );
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={classNames(
        'text-slate-100 bg-blue-600/80 pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium tabular-nums select-none shadow-sm',
        'peer-hover/menu-button:bg-blue-500 peer-data-[active=true]/menu-button:bg-blue-500',
        'peer-data-[size=sm]/menu-button:top-1',
        'peer-data-[size=default]/menu-button:top-1.5',
        'peer-data-[size=lg]/menu-button:top-2.5',
        'group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<'div'> & {
  showIcon?: boolean;
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={classNames(
        'flex h-9 items-center gap-3 rounded-md px-2.5',
        className
      )}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4.5 rounded-md bg-slate-700/50"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1 bg-slate-700/50"
        data-sidebar="menu-skeleton-text"
        style={
          {
            '--skeleton-width': width,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={classNames(
        'mx-3.5 flex min-w-0 translate-x-px flex-col gap-1.5 border-l border-slate-700/30 px-2.5 py-1',
        'group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={classNames('group/menu-sub-item relative', className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  asChild = false,
  size = 'md',
  isActive = false,
  className,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean;
  size?: 'sm' | 'md';
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={classNames(
        'text-slate-300 ring-slate-700 hover:bg-slate-800/60 hover:text-slate-100 active:bg-slate-800 active:text-slate-100 flex h-7 min-w-0 -translate-x-px items-center gap-2.5 overflow-hidden rounded-md px-2.5 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-slate-400',
        'data-[active=true]:bg-slate-800/70 data-[active=true]:text-blue-300 relative',
        isActive &&
          'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-2/3 before:w-0.5 before:rounded-full before:bg-blue-400/70',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        'group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
