import "@testing-library/jest-dom/vitest";
import { act, cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { APICallError } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { afterEach, describe, expect, it, vi } from "vitest";
import i18next from "../i18n";
import { PROVIDERS } from "../lib/chat/config";
import store from "../store/store";
import {
  setChatApiKey,
  setChatProvider,
} from "../store/reducers/settingsReducer";
import { setChatOpen } from "../store/reducers/uiReducer";
import { renderWithProviders } from "./renderWithProviders";

const mockModel = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("../lib/chat/providers", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../lib/chat/providers")>();
  return {
    ...actual,
    createChatModel: () => ({
      model: mockModel.current,
      modelId: "mock-model",
      providerLabel: "Mock",
      nativeTools: {},
      capabilities: { nativeSearch: false, nativeFetch: false },
    }),
  };
});

const usage = {
  inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 1, text: 1, reasoning: 0 },
};

const stream = (parts: unknown[]) => ({
  stream: new ReadableStream({
    start(controller) {
      parts.forEach((p) => controller.enqueue(p));
      controller.close();
    },
  }),
});

afterEach(() => {
  cleanup();
  act(() => {
    store.dispatch(setChatOpen(false));
  });
});

const configure = () =>
  act(() => {
    store.dispatch(setChatProvider("anthropic"));
    store.dispatch(setChatApiKey({ provider: "anthropic", apiKey: "key" }));
    store.dispatch(setChatOpen(true));
  });

describe("ChatMenu", () => {
  it("asks for setup before there is a key", async () => {
    act(() => {
      store.dispatch(setChatProvider("openai"));
      store.dispatch(setChatOpen(true));
    });
    renderWithProviders(<div />);

    expect(
      await screen.findByText(i18next.t("chat:noApiKey"))
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: i18next.t("chat:openSettings") })
    ).toBeInTheDocument();
  });

  it("shows tool progress and the model's reply", async () => {
    mockModel.current = new MockLanguageModelV4({
      doStream: [
        stream([
          {
            type: "tool-call",
            toolCallId: "c1",
            toolName: "search_plugins",
            input: JSON.stringify({ query: "the republic" }),
          },
          {
            type: "finish",
            usage,
            finishReason: { unified: "tool-calls", raw: "tool_use" },
          },
        ]),
        stream([
          { type: "text-start", id: "t" },
          { type: "text-delta", id: "t", delta: "No plugin has " },
          { type: "text-delta", id: "t", delta: "that book." },
          { type: "text-end", id: "t" },
          {
            type: "finish",
            usage,
            finishReason: { unified: "stop", raw: "end_turn" },
          },
        ]),
      ],
    });
    configure();
    renderWithProviders(<div />);
    const user = userEvent.setup();

    const input = await screen.findByRole("textbox", {
      name: i18next.t("chat:placeholder"),
    });
    const send = screen.getByRole("button", { name: i18next.t("chat:send") });
    await user.type(input, "Open the republic");
    await waitFor(() => expect(send).toBeEnabled());
    await user.click(send);

    expect(await screen.findByText("Open the republic")).toBeInTheDocument();
    expect(
      await screen.findByText(
        i18next.t("chat:searchedPlugins", { count: 0, query: "the republic" })
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByText("No plugin has that book.")
    ).toBeInTheDocument();
  });

  it("shows cards only for the options the model picks", async () => {
    mockModel.current = new MockLanguageModelV4({
      doStream: [
        stream([
          {
            type: "tool-call",
            toolCallId: "c1",
            toolName: "show_options",
            input: JSON.stringify({
              links: [
                {
                  title: "The Republic (Jowett)",
                  url: "https://www.gutenberg.org/ebooks/1497.epub3.images",
                },
              ],
            }),
          },
          {
            type: "finish",
            usage,
            finishReason: { unified: "tool-calls", raw: "tool_use" },
          },
        ]),
        stream([
          { type: "text-start", id: "t" },
          { type: "text-delta", id: "t", delta: "Which one?" },
          { type: "text-end", id: "t" },
          {
            type: "finish",
            usage,
            finishReason: { unified: "stop", raw: "end_turn" },
          },
        ]),
      ],
    });
    configure();
    renderWithProviders(<div />);
    const user = userEvent.setup();

    const input = await screen.findByRole("textbox", {
      name: i18next.t("chat:placeholder"),
    });
    const send = screen.getByRole("button", { name: i18next.t("chat:send") });
    await user.type(input, "Open the republic");
    await waitFor(() => expect(send).toBeEnabled());
    await user.click(send);

    expect(
      await screen.findByText("The Republic (Jowett)")
    ).toBeInTheDocument();
    const open = screen.getByRole("link", { name: /EPUB · gutenberg\.org/ });
    expect(open.getAttribute("href")).toContain("/viewer?");
    expect(open.getAttribute("href")).toContain("type=application%2Fepub%2Bzip");
    expect(await screen.findByText("Which one?")).toBeInTheDocument();
  });

  it("explains a rejected key", async () => {
    mockModel.current = new MockLanguageModelV4({
      doStream: async () => {
        throw new APICallError({
          message: "invalid x-api-key",
          url: "https://api.anthropic.com/v1/messages",
          requestBodyValues: {},
          statusCode: 401,
          isRetryable: false,
        });
      },
    });
    configure();
    renderWithProviders(<div />);
    const user = userEvent.setup();

    const input = await screen.findByRole("textbox", {
      name: i18next.t("chat:placeholder"),
    });
    const send = screen.getByRole("button", { name: i18next.t("chat:send") });
    await user.type(input, "hi");
    await waitFor(() => expect(send).toBeEnabled());
    await user.click(send);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      i18next.t("chat:errorAuth", { provider: PROVIDERS.anthropic.label })
    );
  });
});
