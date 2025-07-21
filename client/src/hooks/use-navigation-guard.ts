import { useEffect, useCallback, useState } from "react";
import { useLocation } from "wouter";

interface UseNavigationGuardOptions {
  shouldBlock: boolean;
  onBeforeLeave?: () => void;
  onLeave?: () => void;
}

export function useNavigationGuard({
  shouldBlock,
  onBeforeLeave,
  onLeave,
}: UseNavigationGuardOptions) {
  const [, setLocation] = useLocation();
  const [isBlocking, setIsBlocking] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Override the setLocation function to intercept navigation
  const guardedSetLocation = useCallback(
    (path: string) => {
      if (shouldBlock) {
        setPendingNavigation(path);
        setIsBlocking(true);
        onBeforeLeave?.();
        return;
      }
      setLocation(path);
    },
    [shouldBlock, setLocation, onBeforeLeave]
  );

  // Handle continuing with navigation
  const continueNavigation = useCallback(() => {
    if (pendingNavigation) {
      onLeave?.();
      setLocation(pendingNavigation);
      setPendingNavigation(null);
    }
    setIsBlocking(false);
  }, [pendingNavigation, setLocation, onLeave]);

  // Handle canceling navigation
  const cancelNavigation = useCallback(() => {
    setPendingNavigation(null);
    setIsBlocking(false);
  }, []);

  // Handle browser back/forward buttons and page refresh
  useEffect(() => {
    if (!shouldBlock) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You have an active workout session. Are you sure you want to leave?";
      return e.returnValue;
    };

    const handlePopState = (e: PopStateEvent) => {
      if (shouldBlock) {
        e.preventDefault();
        // Push the current state back to prevent navigation
        window.history.pushState(null, "", window.location.href);
        setIsBlocking(true);
        onBeforeLeave?.();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // Push initial state to enable popstate detection
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [shouldBlock, onBeforeLeave]);

  return {
    isBlocking,
    guardedSetLocation,
    continueNavigation,
    cancelNavigation,
    pendingNavigation,
  };
}
