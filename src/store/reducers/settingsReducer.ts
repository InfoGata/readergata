import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ChatProviderKind =
  | "anthropic"
  | "openai"
  | "google"
  | "openai-compatible";

export type ChatSearchProvider = "tavily" | "brave";

export interface ChatSettings {
  provider: ChatProviderKind;
  /** Kept per provider so switching back and forth doesn't lose a key. */
  apiKeys: Partial<Record<ChatProviderKind, string>>;
  /** Overrides the provider's default model. */
  model?: string;
  /** Only used by openai-compatible endpoints. */
  baseUrl?: string;
  searchProvider?: ChatSearchProvider;
  searchApiKey?: string;
  /**
   * Skip the provider's own web search even where it has one. A provider can
   * offer search but not on every plan: Gemini's free tier has no search
   * quota for Gemini 3, and every request that includes the tool is refused.
   */
  disableNativeSearch?: boolean;
}

const defaultChatSettings: ChatSettings = {
  provider: "anthropic",
  apiKeys: {},
};

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
  /** The chat assistant. Keys stay on this device. */
  chat?: ChatSettings;
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
    setChatProvider: (state, action: PayloadAction<ChatProviderKind>) => {
      const chat = state.chat ?? defaultChatSettings;
      // A model id only means something to the provider it was typed for.
      return {
        ...state,
        chat: { ...chat, provider: action.payload, model: undefined },
      };
    },
    setChatApiKey: (
      state,
      action: PayloadAction<{ provider: ChatProviderKind; apiKey?: string }>
    ) => {
      const chat = state.chat ?? defaultChatSettings;
      return {
        ...state,
        chat: {
          ...chat,
          apiKeys: {
            ...chat.apiKeys,
            [action.payload.provider]: action.payload.apiKey || undefined,
          },
        },
      };
    },
    setChatModel: (state, action: PayloadAction<string | undefined>) => {
      const chat = state.chat ?? defaultChatSettings;
      return {
        ...state,
        chat: { ...chat, model: action.payload || undefined },
      };
    },
    setChatBaseUrl: (state, action: PayloadAction<string | undefined>) => {
      const chat = state.chat ?? defaultChatSettings;
      return {
        ...state,
        chat: { ...chat, baseUrl: action.payload || undefined },
      };
    },
    setChatSearch: (
      state,
      action: PayloadAction<{
        searchProvider?: ChatSearchProvider;
        searchApiKey?: string;
        disableNativeSearch?: boolean;
      }>
    ) => {
      const chat = state.chat ?? defaultChatSettings;
      return {
        ...state,
        chat: {
          ...chat,
          searchProvider: action.payload.searchProvider,
          searchApiKey: action.payload.searchApiKey || undefined,
          disableNativeSearch: action.payload.disableNativeSearch || undefined,
        },
      };
    },
  },
});

export const {
  saveCorsProxyUrl,
  toggleDisableAutoUpdatePlugins,
  setPluginsPreInstalled,
  setDisableAnalytics,
  setChatProvider,
  setChatApiKey,
  setChatModel,
  setChatBaseUrl,
  setChatSearch,
} = settingsSlice.actions;

export default settingsSlice.reducer;
