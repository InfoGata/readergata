import {
  APICallError,
  RetryError,
  stepCountIs,
  streamText,
  type ModelMessage,
} from "ai";
import type { PluginFrameContainer } from "../../contexts/PluginsContext";
import type { ChatSettings } from "../../store/reducers/settingsReducer";
import { buildSystemPrompt } from "./prompt";
import { createChatModel } from "./providers";
import type { ChatRefs, ViewerTarget } from "./refs";
import type { WebSearchConfig } from "./search";
import { createChatTools } from "./tools";

// The only module that reaches the AI SDK and the provider packages. The chat
// panel imports it dynamically, so none of it loads until the first message.

const MAX_STEPS = 12;

export type ChatErrorKind =
  | "auth"
  | "rateLimit"
  | "network"
  | "noTools"
  | "unknown";

export const classifyChatError = (
  error: unknown
): { error: ChatErrorKind; detail?: string } => {
  // After its automatic retries the SDK throws a RetryError; what went wrong
  // is the last attempt's error.
  if (RetryError.isInstance(error)) {
    return classifyChatError(error.lastError);
  }
  if (APICallError.isInstance(error)) {
    const status = error.statusCode;
    if (status === 401 || status === 403) return { error: "auth" };
    // Also how providers report a used-up quota, which the message explains.
    if (status === 429) return { error: "rateLimit", detail: error.message };
    if (status === 400 && /tool/i.test(error.message)) {
      return { error: "noTools", detail: error.message };
    }
    return { error: "unknown", detail: error.message };
  }
  if (error instanceof TypeError) {
    // A refused CORS request or no connection; fetch can't tell them apart.
    return { error: "network", detail: error.message };
  }
  return {
    error: "unknown",
    detail: error instanceof Error ? error.message : String(error),
  };
};

export interface StartChatOptions {
  settings: ChatSettings;
  messages: ModelMessage[];
  plugins: PluginFrameContainer[];
  refs: ChatRefs;
  openInViewer: (target: ViewerTarget) => void;
  search?: WebSearchConfig;
  webSearch: boolean;
  abortSignal: AbortSignal;
}

export const startChat = (options: StartChatOptions) => {
  const chatModel = createChatModel(options.settings);
  const tools = {
    ...createChatTools({
      plugins: options.plugins,
      refs: options.refs,
      openInViewer: options.openInViewer,
      capabilities: chatModel.capabilities,
      search: options.search,
    }),
    ...chatModel.nativeTools,
  };
  return streamText({
    model: chatModel.model,
    system: buildSystemPrompt(options.webSearch),
    messages: options.messages,
    tools,
    stopWhen: stepCountIs(MAX_STEPS),
    abortSignal: options.abortSignal,
    providerOptions: chatModel.providerOptions,
  });
};
