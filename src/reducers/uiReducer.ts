import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  navigationOpen: boolean
}

let initialState: UiState = {
  navigationOpen: false
}

const ebookSlice = createSlice({
  name: "ebook",
  initialState,
  reducers: {
    setNavigationOpen(state, action: PayloadAction<boolean>) {
      state.navigationOpen = action.payload
    }
  }
});

export const {
  setNavigationOpen
} = ebookSlice.actions;

export default ebookSlice.reducer
