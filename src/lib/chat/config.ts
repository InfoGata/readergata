import type {
  ChatProviderKind,
  ChatSettings,
} from "../../store/reducers/settingsReducer";

// Everything here is plain data and imports no AI SDK code, so the settings
// page and the chat panel can use it without pulling the SDK into the shell.
// The SDK itself loads on the first message (see ChatContext).

export interface ProviderInfo {
  label: string;
  defaultModel?: string;
  /** Whether a key is required; local OpenAI-compatible servers often don't. */
  needsApiKey: boolean;
  keyUrl?: string;
}

export const PROVIDERS: Record<ChatProviderKind, ProviderInfo> = {
  anthropic: {
    label: "Anthropic (Claude)",
    defaultModel: "claude-opus-5-5",
    needsApiKey: true,
    keyUrl: "https://console.anthropic.com/settings/keys",
  },
  openai: {
    label: "OpenAI",
    defaultModel: "gpt-5.6",
    needsApiKey: true,
    keyUrl: "https://platform.openai.com/api-keys",
  },
  google: {
    label: "Google Gemini",
    defaultModel: "gemini-3.8-flash",
    needsApiKey: true,
    keyUrl: "https://aistudio.google.com/apikey",
  },
  "openai-compatible": {
    label: "OpenAI-compatible (OpenRouter, Ollama, LM Studio…)",
    needsApiKey: false,
  },
};

export interface ChatCapabilities {
  /** The provider runs web search itself. */
  nativeSearch: boolean;
  /** The provider can fetch a web page itself. */
  nativeFetch: boolean;
}

/** Gemini only accepts its own tools alongside function tools from 3.0 on. */
const geminiMixesTools = (modelId: string) => {
  const match = /^gemini-(\d+)/.exec(modelId);
  return match !== null && Number(match[1]) >= 3;
};

export const getChatModelId = (
  settings: Pick<ChatSettings, "provider" | "model">
) => settings.model || PROVIDERS[settings.provider].defaultModel;

/** Whether the provider can search the web itself with this model. */
export const supportsNativeSearch = (
  settings: Pick<ChatSettings, "provider" | "model">
) => {
  switch (settings.provider) {
    case "anthropic":
    case "openai":
      return true;
    case "google":
      return geminiMixesTools(getChatModelId(settings) ?? "");
    case "openai-compatible":
      return false;
  }
};

export const getChatCapabilities = (
  settings: Pick<ChatSettings, "provider" | "model" | "disableNativeSearch">
): ChatCapabilities => {
  if (settings.disableNativeSearch) {
    return {
      nativeSearch: false,
      // Fetching a page is a separate tool with its own quota.
      nativeFetch: settings.provider === "anthropic",
    };
  }
  switch (settings.provider) {
    case "anthropic":
      return { nativeSearch: true, nativeFetch: true };
    case "openai":
      return { nativeSearch: true, nativeFetch: false };
    case "google":
      return {
        nativeSearch: supportsNativeSearch(settings),
        nativeFetch: false,
      };
    case "openai-compatible":
      return { nativeSearch: false, nativeFetch: false };
  }
};

export type ChatConfigProblem =
  | "noProvider"
  | "noApiKey"
  | "noModel"
  | "noBaseUrl";

/** Why the chat can't run yet, or undefined when it can. */
export const getChatConfigProblem = (
  settings?: ChatSettings
): ChatConfigProblem | undefined => {
  if (!settings) return "noProvider";
  const info = PROVIDERS[settings.provider];
  if (info.needsApiKey && !settings.apiKeys[settings.provider]) {
    return "noApiKey";
  }
  if (settings.provider === "openai-compatible" && !settings.baseUrl) {
    return "noBaseUrl";
  }
  if (!getChatModelId(settings)) return "noModel";
  return undefined;
};
