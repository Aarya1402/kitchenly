"use client";
import Joyride, { CallBackProps, EVENTS } from "react-joyride";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTour } from "./tourContext";
import { TOUR_STEPS } from "./steps";

export default function TourController() {
  const { run, stepIndex, setStepIndex, stopTour } = useTour();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper: wait for a DOM target to appear (polling)
  const waitForTarget = (selector: string, timeout = 2500, interval = 100) => {
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

  // When stepIndex or pathname changes, wait briefly for the target to mount
  const waitingRef = useRef<number | null>(null);
  useEffect(() => {
    if (!mounted || !run || stepIndex >= TOUR_STEPS.length) return;

    const currentStep = TOUR_STEPS[stepIndex];
    if (!currentStep || typeof currentStep.target !== "string") return;

    // body target always exists
    if (currentStep.target === "body") return;

    // Clear any previous wait
    if (waitingRef.current) {
      clearTimeout(waitingRef.current);
      waitingRef.current = null;
    }

    // Wait for the target to appear. If not found within timeout, skip.
    let cancelled = false;
    (async () => {
      const found = await waitForTarget(
        currentStep.target as string,
        2500,
        100,
      );
      if (cancelled) return;
      if (!found) setStepIndex((s) => s + 1);
    })();

    return () => {
      cancelled = true;
      if (waitingRef.current) {
        clearTimeout(waitingRef.current);
        waitingRef.current = null;
      }
    };
  }, [stepIndex, pathname, mounted, run, setStepIndex]);

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
      const stepData = currentStep?.data as any;
      const isPreviousAction = action === "prev";
      const targetRoute = isPreviousAction
        ? stepData?.previous
        : stepData?.next;

      // Check if at the end of tour
      if (index === TOUR_STEPS.length - 1) {
        if (isPreviousAction && stepData?.previous) {
          setStepIndex(index - 1);
          router.push(stepData.previous);
        } else {
          stopTour();
        }
      } else if (targetRoute) {
        // Navigate to next/previous route
        setStepIndex(index + (isPreviousAction ? -1 : 1));
        if (targetRoute !== pathname) {
          router.push(targetRoute);
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
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      // callback={async (data) => {
      //   await setTimeout(() => {
      //     handleCallback(data);
      //   }, 2000);
      // }}
      callback={handleCallback}
      disableScrolling
      styles={{
        options: { zIndex: 10000 },
      }}
    />
  );
}
