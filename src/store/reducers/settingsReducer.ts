import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  corsProxyUrl?: string;
}

const initialState: SettingsState = {};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    saveCorsProxyUrl: (state, action: PayloadAction<string | undefined>) => {
      return {
        ...state,
        corsProxyUrl: action.payload,
      };
    },
  },
});

export const { saveCorsProxyUrl } = settingsSlice.actions;

export default settingsSlice.reducer;
