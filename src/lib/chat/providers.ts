import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel, ToolSet, streamText } from "ai";
import type { ChatSettings } from "../../store/reducers/settingsReducer";
import {
  PROVIDERS,
  getChatCapabilities,
  getChatModelId,
  type ChatCapabilities,
} from "./config";

type ProviderOptions = Parameters<typeof streamText>[0]["providerOptions"];

export interface ChatModel {
  model: LanguageModel;
  modelId: string;
  providerLabel: string;
  nativeTools: ToolSet;
  capabilities: ChatCapabilities;
  providerOptions?: ProviderOptions;
}

/**
 * Models that take effort and server-side refusal fallbacks. Older Claude
 * models reject one or both, and a user can type any model id.
 */
const isCurrentClaude = (modelId: string) =>
  /^claude-(fable-5-1|opus-5-5|opus-5|sonnet-5-5)$/.test(modelId);

/**
 * CapacitorHttp patches window.fetch with a bridge that buffers the whole
 * response, which would turn a streamed reply into one long wait. Capacitor
 * keeps the WebView's own fetch as CapacitorWebFetch; every provider here
 * allows browser CORS, so that one works.
 */
const getFetch = (): typeof fetch => {
  const webFetch = (window as { CapacitorWebFetch?: typeof fetch })
    .CapacitorWebFetch;
  return (webFetch ?? window.fetch).bind(window);
};

export const createChatModel = (settings: ChatSettings): ChatModel => {
  const modelId = getChatModelId(settings);
  if (!modelId) {
    throw new Error("No model configured");
  }
  const apiKey = settings.apiKeys[settings.provider];
  const providerLabel = PROVIDERS[settings.provider].label;
  const fetch = getFetch();

  switch (settings.provider) {
    case "anthropic": {
      const anthropic = createAnthropic({
        apiKey,
        fetch,
        // Anthropic refuses browser requests without this opt-in.
        headers: { "anthropic-dangerous-direct-browser-access": "true" },
      });
      const capabilities = getChatCapabilities(settings);
      return {
        model: anthropic(modelId),
        modelId,
        providerLabel,
        nativeTools: {
          ...(capabilities.nativeSearch
            ? { web_search: anthropic.tools.webSearch_20260209({ maxUses: 5 }) }
            : {}),
          web_fetch: anthropic.tools.webFetch_20260209({ maxUses: 5 }),
        },
        capabilities,
        providerOptions: {
          anthropic: {
            cacheControl: { type: "ephemeral" },
            // Finding a book is chat, not deep reasoning.
            ...(isCurrentClaude(modelId)
              ? { effort: "low", fallbacks: "default" }
              : {}),
          },
        },
      };
    }
    case "openai": {
      const openai = createOpenAI({ apiKey, fetch });
      const capabilities = getChatCapabilities(settings);
      return {
        model: openai(modelId),
        modelId,
        providerLabel,
        nativeTools: capabilities.nativeSearch
          ? { web_search: openai.tools.webSearch({}) }
          : {},
        capabilities,
      };
    }
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey, fetch });
      const capabilities = getChatCapabilities(settings);
      return {
        model: google(modelId),
        modelId,
        providerLabel,
        nativeTools: capabilities.nativeSearch
          ? { google_search: google.tools.googleSearch({}) }
          : {},
        capabilities,
      };
    }
    case "openai-compatible": {
      const provider = createOpenAICompatible({
        name: "openai-compatible",
        baseURL: settings.baseUrl ?? "",
        apiKey: apiKey || undefined,
        fetch,
      });
      return {
        model: provider(modelId),
        modelId,
        providerLabel,
        nativeTools: {},
        capabilities: getChatCapabilities(settings),
      };
    }
  }
};
