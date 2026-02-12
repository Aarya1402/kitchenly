"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Joyride, { CallBackProps, EVENTS } from "react-joyride";

import { TOUR_STEPS } from "./steps";
import { useTour } from "./tourContext";

export default function TourController() {
  const { run, stepIndex, setStepIndex, stopTour } = useTour();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  // Only run Joyride when the current step's target exists (avoids nodeName null error)
  const [targetReady, setTargetReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Helper: wait for a DOM target to appear (polling)
  const waitForTarget = (selector: string, timeout = 5000, interval = 100) => {
    return new Promise<boolean>((resolve) => {
      if (selector === "body") return resolve(true);
      const start = Date.now();

      const check = () => {
        if (
          typeof document !== "undefined" &&
          document.querySelector(selector)
        ) {
          return resolve(true);
        }
        if (Date.now() - start >= timeout) return resolve(false);
        setTimeout(check, interval);
      };

      check();
    });
  };

  // Track previous pathname to detect navigation
  const prevPathnameRef = useRef(pathname);

  // When stepIndex or pathname changes, wait for the target to mount before running Joyride
  const waitingRef = useRef<number | null>(null);
  useEffect(() => {
    if (!mounted || !run || stepIndex >= TOUR_STEPS.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTargetReady(false);
      return;
    }

    const currentStep = TOUR_STEPS[stepIndex];
    if (!currentStep || typeof currentStep.target !== "string") {
      setTargetReady(false);
      return;
    }

    const target = currentStep.target as string;

    // body target always exists
    if (target === "body") {
      setTargetReady(true);
      prevPathnameRef.current = pathname;
      return;
    }

    // Reset so Joyride doesn't run until target exists (prevents nodeName null error)
    setTargetReady(false);

    // Clear any previous wait
    if (waitingRef.current) {
      clearTimeout(waitingRef.current);
      waitingRef.current = null;
    }

    // If pathname changed, add extra delay to let page render (especially for loading states)
    const pathnameChanged = prevPathnameRef.current !== pathname;
    prevPathnameRef.current = pathname;

    // Wait for the target to appear. If not found within timeout, skip step.
    let cancelled = false;
    (async () => {
      // If we just navigated, wait a bit longer for the page to render
      if (pathnameChanged) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        if (cancelled) return;
      }

      const found = await waitForTarget(target, 5000, 100);
      if (cancelled) return;
      if (found) {
        // Small additional delay to ensure element is fully rendered
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (cancelled) return;
        setTargetReady(true);
      } else {
        // Target not found - skip to next step
        setStepIndex((s) => s + 1);
      }
    })();

    return () => {
      cancelled = true;
      if (waitingRef.current) {
        clearTimeout(waitingRef.current);
        waitingRef.current = null;
      }
    };
  }, [stepIndex, pathname, mounted, run, setStepIndex]);

  // Only run Joyride when the current step's target is in the DOM
  // targetReady is set to true only after we've confirmed the target exists
  const runTour = run && targetReady;

  const handleCallback = (data: CallBackProps) => {
    const { action, index, type, status } = data;

    // Handle tour finish/skip
    if (status === "finished" || status === "skipped") {
      stopTour();
      return;
    }

    // Handle target not found - skip to next step silently
    if (type === "error:target_not_found") {
      setStepIndex(index + 1);
      return;
    }

    // Handle step transitions with navigation
    if (type === EVENTS.STEP_AFTER) {
      const currentStep = TOUR_STEPS[index];
      const stepData = currentStep?.data;
      const isPreviousAction = action === "prev";
      const targetRoute = isPreviousAction
        ? stepData?.previous
        : stepData?.next;

      // Check if at the end of tour
      if (index === TOUR_STEPS.length - 1) {
        if (isPreviousAction && stepData?.previous) {
          router.push(stepData.previous);
          // Wait for navigation before updating step index
          setTimeout(() => {
            setStepIndex(index - 1);
          }, 100);
        } else {
          stopTour();
        }
      } else if (targetRoute) {
        // Navigate to next/previous route first, then update step index
        const nextStepIndex = index + (isPreviousAction ? -1 : 1);

        // Handle dynamic routes (e.g., /shopping-lists/:id)
        let routeToNavigate = targetRoute;
        if (targetRoute === "/shopping-lists/:id") {
          // Find the first list card to get its ID
          const listCard = document.querySelector(
            '[data-tour="list-card"]'
          ) as HTMLElement;
          if (listCard && listCard.dataset.listId) {
            routeToNavigate = `/shopping-lists/${listCard.dataset.listId}`;
          } else {
            // Fallback: try to get list ID from API or skip this step
            console.warn("Could not find list ID for tour navigation");
            setStepIndex(nextStepIndex);
            return;
          }
        }

        // Check if we're already on the correct route (including dynamic routes)
        const isAlreadyOnRoute =
          routeToNavigate === pathname ||
          (targetRoute === "/shopping-lists/:id" &&
            pathname.startsWith("/shopping-lists/") &&
            pathname !== "/shopping-lists");

        if (!isAlreadyOnRoute) {
          router.push(routeToNavigate);
          // Wait for navigation to complete before updating step index
          // This ensures pathname changes first, triggering the target wait logic
          setTimeout(() => {
            setStepIndex(nextStepIndex);
          }, 100);
        } else {
          // Already on the correct route, just update step index
          setStepIndex(nextStepIndex);
        }
      } else {
        // No route specified, advance normally
        setStepIndex(index + (isPreviousAction ? -1 : 1));
      }
    }
  };

  if (!mounted) return null;

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={runTour}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      callback={handleCallback}
      disableScrolling
      styles={{
        /* ───────── GLOBAL OPTIONS ───────── */
        options: {
          zIndex: 40, // base layer
          primaryColor: "var(--foreground)",
          overlayColor: "rgba(0, 0, 0, 0.35)",
          width: 420,
        },

        buttonNext: {
          backgroundColor: "var(--foreground)",
          color: "var(--background)",
          fontSize: "0.875rem",
          fontWeight: "500",
          padding: "0.5rem 1.25rem",
          borderRadius: "0.5rem",
          border: "none",
          cursor: "pointer",
        },

        buttonBack: {
          backgroundColor: "transparent",
          color: "hsl(var(--foreground))",
          fontSize: "0.875rem",
          fontWeight: "500",
          padding: "0.5rem 1.25rem",
          borderRadius: "0.5rem",
          border: "1px solid hsl(var(--border))",
          cursor: "pointer",
        },

        buttonSkip: {
          backgroundColor: "transparent",
          color: "hsl(var(--muted-foreground))",
          fontSize: "0.75rem",
          fontWeight: "500",
          padding: "0.25rem 0.5rem",
          border: "none",
          cursor: "pointer",
        },
      }}
    />
  );
}
