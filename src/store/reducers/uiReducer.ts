import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  navigationOpen: boolean;
  isFullscreen: boolean;
  tocOpen: boolean;
  waitingServiceWorker?: ServiceWorker;
}

let initialState: UiState = {
  navigationOpen: false,
  isFullscreen: false,
  tocOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setNavigationOpen(state, action: PayloadAction<boolean>) {
      state.navigationOpen = action.payload;
    },
    setIsFullscreen(state, action: PayloadAction<boolean>) {
      state.isFullscreen = action.payload;
    },
    setTocOpen(state, action: PayloadAction<boolean>) {
      state.tocOpen = action.payload;
    },
    updateReady(state, action: PayloadAction<ServiceWorker>) {
      state.waitingServiceWorker = action.payload;
    },
  },
});

export const { setNavigationOpen, setIsFullscreen, setTocOpen, updateReady } =
  uiSlice.actions;

export default uiSlice.reducer;
