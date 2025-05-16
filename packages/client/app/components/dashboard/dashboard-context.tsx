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
  const contextRef = React.useRef<HTMLDivElement>(null);

  // Listen for custom events from the sidebar component
  React.useEffect(() => {
    const handleSetActiveView = (e: CustomEvent) => {
      if (e.detail && e.detail.view) {
        setActiveView(e.detail.view);
      }
    };

    const currentRef = contextRef.current;

    if (currentRef) {
      currentRef.addEventListener(
        'setActiveView',
        handleSetActiveView as EventListener
      );
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener(
          'setActiveView',
          handleSetActiveView as EventListener
        );
      }
    };
  }, []);

  // When activeView changes, update the data attribute and dispatch an event for listeners
  React.useEffect(() => {
    if (contextRef.current) {
      contextRef.current.setAttribute('data-active-view', activeView);

      // Dispatch an event to notify any listeners about the view change
      const viewChangeEvent = new CustomEvent('viewChange', {
        detail: { view: activeView },
        bubbles: true,
      });
      contextRef.current.dispatchEvent(viewChangeEvent);
    }
  }, [activeView]);

  return (
    <div
      ref={contextRef}
      data-dashboard-context="true"
      data-active-view={activeView}
    >
      <DashboardContext.Provider value={{ activeView, setActiveView }}>
        {children}
      </DashboardContext.Provider>
    </div>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);

  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }

  return context;
}

// This hook can be used to navigate between views from anywhere
export function useViewNavigation() {
  const contextRef = React.useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);

  React.useEffect(() => {
    // Find the dashboard context element
    contextRef.current = document.querySelector(
      '[data-dashboard-context="true"]'
    );
    setReady(!!contextRef.current);
  }, []);

  const navigateTo = React.useCallback((view: ViewType) => {
    if (contextRef.current) {
      // Update the attribute immediately for faster UI feedback
      contextRef.current.setAttribute('data-active-view', view);

      // Dispatch both events for listeners
      const setViewEvent = new CustomEvent('setActiveView', {
        detail: { view },
      });
      contextRef.current.dispatchEvent(setViewEvent);

      const viewChangeEvent = new CustomEvent('viewChange', {
        detail: { view },
        bubbles: true,
      });
      contextRef.current.dispatchEvent(viewChangeEvent);

      return true;
    }

    // Fallback to URL navigation if context is not found
    let path = '/';
    switch (view) {
      case 'dashboard':
        path = '/';
        break;
      case 'job-analysis':
        path = '/job-analysis';
        break;
      case 'my-data':
        path = '/my-data';
        break;
      case 'profile':
        path = '/settings';
        break;
    }
    if (typeof window !== 'undefined') {
      window.location.pathname = path;
    }
    return false;
  }, []);

  return {
    navigateTo,
    ready,
  };
}
