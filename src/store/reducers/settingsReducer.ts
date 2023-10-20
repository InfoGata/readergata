import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  corsProxyUrl?: string;
  disableAutoUpdatePlugins?: boolean;
  pluginsPreinstalled?: boolean;
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
    setPluginsPreInstalled: (state) => {
      return { ...state, pluginsPreinstalled: true };
    },
  },
});

export const {
  saveCorsProxyUrl,
  toggleDisableAutoUpdatePlugins,
  setPluginsPreInstalled,
} = settingsSlice.actions;

export default settingsSlice.reducer;
