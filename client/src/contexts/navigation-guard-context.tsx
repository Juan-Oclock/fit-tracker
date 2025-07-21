import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useLocation } from 'wouter';

interface NavigationGuardContextType {
  isBlocking: boolean;
  shouldBlock: boolean;
  pendingNavigation: string | null;
  setShouldBlock: (should: boolean) => void;
  guardedNavigate: (path: string) => void;
  continueNavigation: () => void;
  cancelNavigation: () => void;
  onBeforeLeave?: () => void;
  onLeave?: () => void;
  setCallbacks: (callbacks: { onBeforeLeave?: () => void; onLeave?: () => void }) => void;
}

const NavigationGuardContext = createContext<NavigationGuardContextType | null>(null);

interface NavigationGuardProviderProps {
  children: ReactNode;
}

export function NavigationGuardProvider({ children }: NavigationGuardProviderProps) {
  const [, setLocation] = useLocation();
  const [shouldBlock, setShouldBlock] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [callbacks, setCallbacks] = useState<{
    onBeforeLeave?: () => void;
    onLeave?: () => void;
  }>({});

  const guardedNavigate = useCallback((path: string) => {
    if (shouldBlock) {
      setPendingNavigation(path);
      setIsBlocking(true);
      callbacks.onBeforeLeave?.();
      return;
    }
    setLocation(path);
  }, [shouldBlock, setLocation, callbacks.onBeforeLeave]);

  const continueNavigation = useCallback(() => {
    if (pendingNavigation) {
      callbacks.onLeave?.();
      setLocation(pendingNavigation);
      setPendingNavigation(null);
    }
    setIsBlocking(false);
  }, [pendingNavigation, setLocation, callbacks.onLeave]);

  const cancelNavigation = useCallback(() => {
    setPendingNavigation(null);
    setIsBlocking(false);
  }, []);

  const value: NavigationGuardContextType = {
    isBlocking,
    shouldBlock,
    pendingNavigation,
    setShouldBlock,
    guardedNavigate,
    continueNavigation,
    cancelNavigation,
    onBeforeLeave: callbacks.onBeforeLeave,
    onLeave: callbacks.onLeave,
    setCallbacks,
  };

  return (
    <NavigationGuardContext.Provider value={value}>
      {children}
    </NavigationGuardContext.Provider>
  );
}

export function useNavigationGuardContext() {
  const context = useContext(NavigationGuardContext);
  if (!context) {
    throw new Error('useNavigationGuardContext must be used within a NavigationGuardProvider');
  }
  return context;
}
