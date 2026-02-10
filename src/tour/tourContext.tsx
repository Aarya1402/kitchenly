"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useUser } from "@clerk/nextjs";
import { useDispatch, useSelector } from "react-redux";
import { TourContextType } from "@/types/tourContextType";
import {
  markTourDone,
  markTourStarted,
  type TourState,
} from "@/store/slices/tourSlice";
import type { RootState } from "@/store";

const TourContext = createContext<TourContextType | null>(null);

function selectTour(state: RootState): TourState {
  return state.tour;
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const { isLoaded, isSignedIn } = useUser();
  const dispatch = useDispatch();
  const { tourDone, tourStarted } = useSelector(selectTour);

  // Start tour automatically after login
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && !tourDone && !tourStarted) {
      const id = setTimeout(() => {
        setRun(true);
        setStepIndex(0);
        dispatch(markTourStarted());
      }, 1500);

      return () => clearTimeout(id);
    }
  }, [isLoaded, isSignedIn, tourDone, tourStarted, dispatch]);

  const startTour = () => {
    setRun(true);
    setStepIndex(0);
  };

  const stopTour = () => {
    setRun(false);
    setStepIndex(0);
    dispatch(markTourDone());
  };

  const advanceStep = () => {
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
