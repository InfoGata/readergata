import type { ModelMessage } from "ai";
import { useNavigate } from "@tanstack/react-router";
import { nanoid } from "nanoid";
import React from "react";
import usePlugins from "../hooks/usePlugins";
import {
  PROVIDERS,
  getChatCapabilities,
  getChatConfigProblem,
  getChatModelId,
  type ChatConfigProblem,
} from "../lib/chat/config";
import type { ChatErrorKind } from "../lib/chat/engine";
import { ChatRefs, type ViewerTarget } from "../lib/chat/refs";
import type { WebSearchConfig } from "../lib/chat/search";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setChatOpen } from "../store/reducers/uiReducer";

// The AI SDK and provider packages are several hundred KB, so they're loaded
// on the first message rather than with the app shell.
const loadEngine = () => import("../lib/chat/engine");

export type ChatItem =
  | { id: string; kind: "user"; text: string }
  | { id: string; kind: "assistant"; text: string }
  | {
      id: string;
      kind: "tool";
      toolCallId: string;
      toolName: string;
      input: unknown;
      status: "running" | "done" | "error";
      output?: unknown;
    }
  | { id: string; kind: "error"; error: ChatErrorKind; detail?: string };

export type ChatStatus = "idle" | "streaming";

interface ChatContextInterface {
  items: ChatItem[];
  status: ChatStatus;
  configProblem?: ChatConfigProblem;
  model?: { modelId: string; providerLabel: string };
  webSearch: boolean;
  refs: ChatRefs;
  send: (text: string) => Promise<void>;
  stop: () => void;
  reset: () => void;
}

export const ChatContext = React.createContext<ChatContextInterface>(
  undefined!
);

const hasError = (output: unknown) =>
  !!output && typeof output === "object" && "error" in output;

const isNarrowScreen = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(max-width: 767px)").matches;

export const ChatProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const settings = useAppSelector((state) => state.settings.chat);
  const { plugins, pluginsLoaded } = usePlugins();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [items, setItems] = React.useState<ChatItem[]>([]);
  const [status, setStatus] = React.useState<ChatStatus>("idle");
  const historyRef = React.useRef<ModelMessage[]>([]);
  const refsRef = React.useRef(new ChatRefs());
  const abortRef = React.useRef<AbortController | undefined>(undefined);

  const configProblem = getChatConfigProblem(settings);
  const modelId = settings ? getChatModelId(settings) : undefined;
  const model =
    settings && modelId && !configProblem
      ? { modelId, providerLabel: PROVIDERS[settings.provider].label }
      : undefined;
  const search: WebSearchConfig | undefined = React.useMemo(
    () =>
      settings?.searchProvider && settings.searchApiKey
        ? { provider: settings.searchProvider, apiKey: settings.searchApiKey }
        : undefined,
    [settings?.searchProvider, settings?.searchApiKey]
  );
  const webSearch = settings
    ? getChatCapabilities(settings).nativeSearch || !!search
    : false;

  const reset = React.useCallback(() => {
    abortRef.current?.abort();
    historyRef.current = [];
    refsRef.current.clear();
    setItems([]);
  }, []);

  // History holds provider-specific parts (reasoning, server tool results)
  // that another provider or model can't read back, so a switch starts over.
  const modelKey = settings ? `${settings.provider}:${modelId}` : undefined;
  React.useEffect(() => {
    reset();
  }, [modelKey, reset]);

  const openInViewer = React.useCallback(
    (target: ViewerTarget) => {
      navigate({
        to: "/viewer",
        search: {
          pluginId: target.pluginId,
          source: encodeURIComponent(target.source),
          type: target.type,
        },
      });
      if (isNarrowScreen()) {
        dispatch(setChatOpen(false));
      }
    },
    [navigate, dispatch]
  );

  const updateItem = (id: string, update: (item: ChatItem) => ChatItem) =>
    setItems((prev) =>
      prev.map((item) => (item.id === id ? update(item) : item))
    );

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (
      !trimmed ||
      !settings ||
      configProblem ||
      status === "streaming" ||
      !pluginsLoaded
    ) {
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("streaming");
    setItems((prev) => [
      ...prev,
      { id: nanoid(), kind: "user", text: trimmed },
    ]);

    const userMessage: ModelMessage = { role: "user", content: trimmed };

    // The assistant item text is streamed into; a tool call ends it, so text
    // after the call starts a new one below the tool's row.
    let assistantId: string | undefined;
    const toolItemIds = new Map<string, string>();

    let engine: Awaited<ReturnType<typeof loadEngine>> | undefined;
    try {
      engine = await loadEngine();
      const result = engine.startChat({
        settings,
        messages: [...historyRef.current, userMessage],
        plugins,
        refs: refsRef.current,
        openInViewer,
        search,
        webSearch,
        abortSignal: controller.signal,
      });

      for await (const part of result.fullStream) {
        switch (part.type) {
          case "text-delta": {
            if (!part.text) break;
            if (!assistantId) {
              const id = nanoid();
              assistantId = id;
              setItems((prev) => [
                ...prev,
                { id, kind: "assistant", text: part.text },
              ]);
            } else {
              const id = assistantId;
              updateItem(id, (item) =>
                item.kind === "assistant"
                  ? { ...item, text: item.text + part.text }
                  : item
              );
            }
            break;
          }
          case "tool-call": {
            assistantId = undefined;
            const id = nanoid();
            toolItemIds.set(part.toolCallId, id);
            setItems((prev) => [
              ...prev,
              {
                id,
                kind: "tool",
                toolCallId: part.toolCallId,
                toolName: part.toolName,
                input: part.input,
                status: "running",
              },
            ]);
            break;
          }
          case "tool-result": {
            const id = toolItemIds.get(part.toolCallId);
            if (id) {
              updateItem(id, (item) =>
                item.kind === "tool"
                  ? {
                      ...item,
                      // Tools report expected failures as an error in their
                      // result, so the model can react; show them as failed.
                      status: hasError(part.output) ? "error" : "done",
                      output: part.output,
                    }
                  : item
              );
            }
            break;
          }
          case "tool-error": {
            const id = toolItemIds.get(part.toolCallId);
            if (id) {
              updateItem(id, (item) =>
                item.kind === "tool" ? { ...item, status: "error" } : item
              );
            }
            break;
          }
          case "error":
            throw part.error;
        }
      }

      const response = await result.response;
      historyRef.current = [
        ...historyRef.current,
        userMessage,
        ...response.messages,
      ];
    } catch (error) {
      // A stopped or failed turn leaves history as it was, so the next
      // message isn't sent after a dangling tool call.
      if (!controller.signal.aborted) {
        setItems((prev) => [
          ...prev,
          {
            id: nanoid(),
            kind: "error",
            ...(engine?.classifyChatError(error) ?? {
              // The engine chunk itself failed to load, e.g. offline.
              error: "network" as const,
              detail: String(error),
            }),
          },
        ]);
      }
    } finally {
      setItems((prev) =>
        prev.map((item) =>
          item.kind === "tool" && item.status === "running"
            ? { ...item, status: "error" }
            : item
        )
      );
      if (abortRef.current === controller) {
        abortRef.current = undefined;
      }
      setStatus("idle");
    }
  };

  const stop = () => abortRef.current?.abort();

  return (
    <ChatContext.Provider
      value={{
        items,
        status,
        configProblem,
        model,
        webSearch,
        refs: refsRef.current,
        send,
        stop,
        reset,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
