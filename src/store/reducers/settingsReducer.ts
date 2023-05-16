import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  corsProxyUrl?: string;
  disableAutoUpdatePlugins?: boolean;
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
    toggleDisableAutoUpdatePlugins: (state) => {
      return {
        ...state,
        autoUpdatePlugins: !state.disableAutoUpdatePlugins,
      };
    },
  },
});

export const { saveCorsProxyUrl, toggleDisableAutoUpdatePlugins } =
  settingsSlice.actions;

export default settingsSlice.reducer;
