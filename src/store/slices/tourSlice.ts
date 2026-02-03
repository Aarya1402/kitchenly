import { createSlice } from "@reduxjs/toolkit";

export type TourState = {
  tourDone: boolean;
  tourStarted: boolean;
};

const initialState: TourState = {
  tourDone: false,
  tourStarted: false,
};

export const tourSlice = createSlice({
  name: "tour",
  initialState,
  reducers: {
    setTourStarted: (state, action: { payload: boolean }) => {
      state.tourStarted = action.payload;
    },
    setTourDone: (state, action: { payload: boolean }) => {
      state.tourDone = action.payload;
    },
    markTourStarted: (state) => {
      state.tourStarted = true;
    },
    markTourDone: (state) => {
      state.tourDone = true;
    },
  },
});

export const { setTourStarted, setTourDone, markTourStarted, markTourDone } =
  tourSlice.actions;
export default tourSlice.reducer;
