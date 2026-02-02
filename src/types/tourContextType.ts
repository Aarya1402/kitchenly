import {
    Dispatch,
    SetStateAction
} from "react";
export type TourContextType = {
  run: boolean;
  stepIndex: number;
  startTour: () => void;
  stopTour: () => void;
  advanceStep: () => void;
  setStepIndex: Dispatch<SetStateAction<number>>;
};
