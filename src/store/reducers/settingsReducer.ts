import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  corsProxyUrl?: string;
  disableAutoUpdatePlugins?: boolean;
  pluginsPreinstalled?: boolean;
  /**
   * Stored as an opt-out so an existing install, whose persisted settings
   * predate it, reads as analytics on -- the same default a new one gets. Do
   * Not Track overrides it; see lib/analytics.
   */
  disableAnalytics?: boolean;
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
        disableAutoUpdatePlugins: !state.disableAutoUpdatePlugins,
      };
    },
    setPluginsPreInstalled: (state) => {
      return { ...state, pluginsPreinstalled: true };
    },
    setDisableAnalytics: (state, action: PayloadAction<boolean>) => {
      return { ...state, disableAnalytics: action.payload };
    },
  },
});

export const {
  saveCorsProxyUrl,
  toggleDisableAutoUpdatePlugins,
  setPluginsPreInstalled,
  setDisableAnalytics,
} = settingsSlice.actions;

export default settingsSlice.reducer;
