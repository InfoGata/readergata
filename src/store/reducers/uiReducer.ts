import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  navigationOpen: boolean;
  isFullscreen: boolean;
  tocOpen: boolean;
}

let initialState: UiState = {
  navigationOpen: false,
  isFullscreen: false,
  tocOpen: false,
};

const ebookSlice = createSlice({
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
  },
});

export const { setNavigationOpen, setIsFullscreen, setTocOpen } =
  ebookSlice.actions;

export default ebookSlice.reducer;
