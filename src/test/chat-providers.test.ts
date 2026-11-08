import { describe, expect, it } from "vitest";
import { getChatConfigProblem } from "@/lib/chat/config";
import { createChatModel } from "@/lib/chat/providers";
import settingsReducer, {
  setChatApiKey,
  setChatModel,
  setChatProvider,
  setChatSearch,
} from "@/store/reducers/settingsReducer";

describe("getChatConfigProblem", () => {
  it("asks for whatever the chosen provider still needs", () => {
    expect(getChatConfigProblem(undefined)).toBe("noProvider");
    expect(getChatConfigProblem({ provider: "anthropic", apiKeys: {} })).toBe(
      "noApiKey"
    );
    expect(
      getChatConfigProblem({ provider: "anthropic", apiKeys: { anthropic: "k" } })
    ).toBeUndefined();
    // Local servers need no key, but do need a url and a model.
    expect(
      getChatConfigProblem({ provider: "openai-compatible", apiKeys: {} })
    ).toBe("noBaseUrl");
    expect(
      getChatConfigProblem({
        provider: "openai-compatible",
        apiKeys: {},
        baseUrl: "http://localhost:11434/v1",
      })
    ).toBe("noModel");
    expect(
      getChatConfigProblem({
        provider: "openai-compatible",
        apiKeys: {},
        baseUrl: "http://localhost:11434/v1",
        model: "llama3.1",
      })
    ).toBeUndefined();
  });
});

describe("createChatModel", () => {
  it("uses native web search where the provider has it", () => {
    const anthropic = createChatModel({
      provider: "anthropic",
      apiKeys: { anthropic: "k" },
    });
    expect(anthropic.modelId).toBe("claude-opus-5-5");
    expect(anthropic.capabilities).toEqual({
      nativeSearch: true,
      nativeFetch: true,
    });
    expect(Object.keys(anthropic.nativeTools)).toEqual([
      "web_search",
      "web_fetch",
    ]);

    const openai = createChatModel({ provider: "openai", apiKeys: { openai: "k" } });
    expect(openai.capabilities).toEqual({ nativeSearch: true, nativeFetch: false });
  });

  it("falls back to app-side search for Gemini models that can't mix tools", () => {
    const gemini3 = createChatModel({
      provider: "google",
      apiKeys: { google: "k" },
      model: "gemini-3.8-flash",
    });
    expect(gemini3.capabilities.nativeSearch).toBe(true);

    const gemini2 = createChatModel({
      provider: "google",
      apiKeys: { google: "k" },
      model: "gemini-2.5-flash",
    });
    expect(gemini2.capabilities.nativeSearch).toBe(false);
    expect(gemini2.nativeTools).toEqual({});
  });

  it("only sends effort and fallbacks to Claude models that take them", () => {
    const current = createChatModel({
      provider: "anthropic",
      apiKeys: { anthropic: "k" },
    });
    expect(current.providerOptions?.anthropic).toMatchObject({
      effort: "low",
      fallbacks: "default",
    });

    const older = createChatModel({
      provider: "anthropic",
      apiKeys: { anthropic: "k" },
      model: "claude-haiku-4-5",
    });
    expect(older.providerOptions?.anthropic).not.toHaveProperty("effort");
    expect(older.providerOptions?.anthropic).not.toHaveProperty("fallbacks");
  });

  it("has no native web tools for OpenAI-compatible servers", () => {
    const local = createChatModel({
      provider: "openai-compatible",
      apiKeys: {},
      baseUrl: "http://localhost:11434/v1",
      model: "llama3.1",
    });
    expect(local.capabilities).toEqual({
      nativeSearch: false,
      nativeFetch: false,
    });
  });
});

describe("chat settings", () => {
  it("keeps each provider's key and clears the model on a switch", () => {
    let state = settingsReducer({}, setChatApiKey({ provider: "anthropic", apiKey: "a" }));
    state = settingsReducer(state, setChatModel("claude-sonnet-5-5"));
    state = settingsReducer(state, setChatProvider("openai"));
    state = settingsReducer(state, setChatApiKey({ provider: "openai", apiKey: "o" }));

    expect(state.chat).toMatchObject({
      provider: "openai",
      apiKeys: { anthropic: "a", openai: "o" },
    });
    expect(state.chat?.model).toBeUndefined();
  });

  it("stores an empty key or search key as unset", () => {
    let state = settingsReducer({}, setChatApiKey({ provider: "openai", apiKey: "" }));
    expect(state.chat?.apiKeys.openai).toBeUndefined();
    state = settingsReducer(
      state,
      setChatSearch({ searchProvider: "brave", searchApiKey: "" })
    );
    expect(state.chat?.searchApiKey).toBeUndefined();
  });
});

describe("classifyChatError", () => {
  it("looks through the SDK's retry wrapper to the provider's error", async () => {
    const { APICallError, RetryError } = await import("ai");
    const { classifyChatError } = await import("@/lib/chat/engine");
    const quota = new APICallError({
      message: "You exceeded your current quota",
      url: "https://generativelanguage.googleapis.com",
      requestBodyValues: {},
      statusCode: 429,
      isRetryable: true,
    });
    const wrapped = new RetryError({
      message: "Failed after 3 attempts",
      reason: "maxRetriesExceeded",
      errors: [quota, quota, quota],
    });
    expect(classifyChatError(wrapped)).toEqual({
      error: "rateLimit",
      detail: "You exceeded your current quota",
    });
  });
});

describe("disableNativeSearch", () => {
  it("leaves the provider's search tool out of every request", () => {
    // Gemini's free tier has no search quota for Gemini 3, and a request
    // that merely includes the tool is refused.
    const gemini = createChatModel({
      provider: "google",
      apiKeys: { google: "k" },
      model: "gemini-3.5-flash-lite",
      disableNativeSearch: true,
    });
    expect(gemini.nativeTools).toEqual({});
    expect(gemini.capabilities.nativeSearch).toBe(false);

    const claude = createChatModel({
      provider: "anthropic",
      apiKeys: { anthropic: "k" },
      disableNativeSearch: true,
    });
    expect(Object.keys(claude.nativeTools)).toEqual(["web_fetch"]);
    expect(claude.capabilities).toEqual({
      nativeSearch: false,
      nativeFetch: true,
    });
  });
});
