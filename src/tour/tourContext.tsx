"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { useUser } from "@clerk/nextjs";

type TourContextType = {
  run: boolean;
  stepIndex: number;
  startTour: () => void;
  stopTour: () => void;
  advanceStep: () => void;
  setStepIndex: Dispatch<SetStateAction<number>>;
};

const TourContext = createContext<TourContextType | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const { user, isLoaded, isSignedIn } = useUser();

  // ✅ Start tour automatically after login
  useEffect(() => {
    if (!isLoaded) return; // Wait for auth to load

    const done = localStorage.getItem("app-tour-done");
    const hasSeenTour = localStorage.getItem("app-tour-started");

    // If user is signed in and hasn't done or started the tour, start it
    if (isSignedIn && done !== "true" && !hasSeenTour) {
      const id = setTimeout(() => {
        setRun(true);
        setStepIndex(0);
        localStorage.setItem("app-tour-started", "true");
      }, 1500); // slightly longer = safer

      return () => clearTimeout(id);
    }
  }, [isLoaded, isSignedIn]);

  const startTour = () => {
    setRun(true);
    setStepIndex(0);
  };

  const stopTour = () => {
    setRun(false);
    setStepIndex(0);
    localStorage.setItem("app-tour-done", "true");
  };

  const advanceStep = () => {
    console.log("Advancing tour step from context");
    setStepIndex((s) => s + 1);
  };

  return (
    <TourContext.Provider
      value={{
        run,
        stepIndex,
        startTour,
        stopTour,
        advanceStep,
        setStepIndex,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error("useTour must be used inside TourProvider");
  }
  return ctx;
}
