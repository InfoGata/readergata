import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  navigationOpen: boolean;
  isFullscreen: boolean;
}

let initialState: UiState = {
  navigationOpen: false,
  isFullscreen: false,
};

const ebookSlice = createSlice({
  name: "ebook",
  initialState,
  reducers: {
    setNavigationOpen(state, action: PayloadAction<boolean>) {
      state.navigationOpen = action.payload;
    },
    setIsFullscreen(state, action: PayloadAction<boolean>) {
      state.isFullscreen = action.payload;
    },
  },
});

export const { setNavigationOpen, setIsFullscreen } = ebookSlice.actions;

export default ebookSlice.reducer;
