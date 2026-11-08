import type { PluginFrameContainer } from "@/contexts/PluginsContext";
import type { ToolSet } from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Feed, Publication } from "../plugintypes";

const corsFetch = vi.fn();
vi.mock("../utils", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../utils")>()),
  corsFetch: (...args: unknown[]) => corsFetch(...args),
}));

const { createChatTools, searchPlugins } = await import("@/lib/chat/tools");
const { ChatRefs } = await import("@/lib/chat/refs");
const { parsePage } = await import("@/lib/chat/search");

const republic: Publication = {
  title: "The Republic",
  authors: [{ name: "Plato" }],
  sources: [
    {
      name: "EPUB",
      source: "opaque-token-123",
      type: "application/epub+zip",
      acquisitionType: "open-access",
    },
  ],
};

const fakePlugin = (
  id: string,
  options: {
    onSearch?: () => Promise<Feed>;
    onGetPublicationDetails?: () => Promise<Publication>;
  }
) =>
  ({
    id,
    name: `${id} plugin`,
    hasDefined: {
      onSearch: async () => !!options.onSearch,
      onGetPublicationDetails: async () => !!options.onGetPublicationDetails,
    },
    remote: {
      onSearch: vi.fn(options.onSearch ?? (async () => ({}) as Feed)),
      onGetPublicationDetails: vi.fn(
        options.onGetPublicationDetails ?? (async () => ({}) as Publication)
      ),
    },
  }) as unknown as PluginFrameContainer;

const execOptions = { toolCallId: "call", messages: [] };

// The tools' typed results are a union of every tool's; tests read fields off
// the one they called.
const run = (tools: ToolSet, name: string, input: unknown) =>
  tools[name].execute!(input, execOptions as never) as Promise<any>;

beforeEach(() => {
  corsFetch.mockReset();
});

describe("searchPlugins", () => {
  it("collects results from every searchable plugin", async () => {
    const refs = new ChatRefs();
    const result = await searchPlugins(
      [
        fakePlugin("gutenberg", {
          onSearch: async () => ({ type: "publication", items: [republic] }),
        }),
        fakePlugin("nosearch", {}),
      ],
      refs,
      "republic"
    );

    // The plugin without onSearch isn't counted as searched.
    expect(result.searchedPlugins).toBe(1);
    const [entry] = result.plugins[0].results;
    expect(entry.title).toBe("The Republic");
    expect(entry.authors).toEqual(["Plato"]);
    // The model only ever sees a ref, never the opaque source string.
    expect(JSON.stringify(result)).not.toContain("opaque-token-123");
    const source = refs.get(entry.sources![0].ref);
    expect(source).toMatchObject({
      kind: "source",
      pluginId: "gutenberg",
      source: { source: "opaque-token-123" },
    });
  });

  it("reports a failing plugin without losing the others", async () => {
    const result = await searchPlugins(
      [
        fakePlugin("broken", {
          onSearch: async () => {
            throw new Error("boom");
          },
        }),
        fakePlugin("good", {
          onSearch: async () => ({ type: "publication", items: [republic] }),
        }),
      ],
      new ChatRefs(),
      "republic"
    );

    expect(result.plugins).toHaveLength(2);
    expect(result.plugins[0]).toMatchObject({
      pluginId: "broken",
      error: "boom",
    });
    expect(result.plugins[1].results).toHaveLength(1);
  });

  it("only searches the plugins asked for", async () => {
    const other = fakePlugin("other", {
      onSearch: async () => ({ type: "publication", items: [] }),
    });
    await searchPlugins(
      [
        fakePlugin("wanted", {
          onSearch: async () => ({ type: "publication", items: [] }),
        }),
        other,
      ],
      new ChatRefs(),
      "q",
      ["wanted"]
    );
    expect(other.remote.onSearch).not.toHaveBeenCalled();
  });
});

describe("chat tools", () => {
  const capabilities = { nativeSearch: true, nativeFetch: true };

  it("opens a plugin source in the viewer the way PublicationSourceButton does", async () => {
    const refs = new ChatRefs();
    const openInViewer = vi.fn();
    const tools = createChatTools({
      plugins: [
        fakePlugin("gutenberg", {
          onSearch: async () => ({ type: "publication", items: [republic] }),
        }),
      ],
      refs,
      openInViewer,
      capabilities,
    });

    const search = await run(tools, "search_plugins", { query: "republic" });
    const ref = search.plugins[0].results[0].sources[0].ref;
    const opened = await run(tools, "open_publication", { ref });

    expect(opened).toEqual({ opened: true, title: "The Republic" });
    expect(openInViewer).toHaveBeenCalledWith({
      pluginId: "gutenberg",
      source: "opaque-token-123",
      type: "application/epub+zip",
    });
  });

  it("refuses a publication ref where a source ref is needed", async () => {
    const refs = new ChatRefs();
    const ref = refs.add({
      kind: "publication",
      pluginId: "p",
      publication: republic,
    });
    const openInViewer = vi.fn();
    const tools = createChatTools({
      plugins: [],
      refs,
      openInViewer,
      capabilities,
    });
    const result = await run(tools, "open_publication", { ref });
    expect(result.error).toBeDefined();
    expect(openInViewer).not.toHaveBeenCalled();
  });

  it("fetches sources for a result that only has details", async () => {
    const refs = new ChatRefs();
    const ref = refs.add({
      kind: "publication",
      pluginId: "lib",
      publication: { title: "The Republic", apiId: "42" },
    });
    const plugin = fakePlugin("lib", {
      onGetPublicationDetails: async () => republic,
    });
    const tools = createChatTools({
      plugins: [plugin],
      refs,
      openInViewer: vi.fn(),
      capabilities,
    });

    const details = await run(tools, "get_publication", { ref });
    expect(plugin.remote.onGetPublicationDetails).toHaveBeenCalledWith({
      apiId: "42",
    });
    expect(refs.get(details.sources[0].ref)).toMatchObject({ kind: "source" });
  });

  it("reports refs show_options can't display", async () => {
    const refs = new ChatRefs();
    const ref = refs.add({
      kind: "publication",
      pluginId: "p",
      publication: republic,
    });
    const tools = createChatTools({
      plugins: [],
      refs,
      openInViewer: vi.fn(),
      capabilities,
    });
    const result = await run(tools, "show_options", {
      refs: [ref, "r999"],
      links: [{ title: "Jowett", url: "https://example.com/republic.epub" }],
    });
    expect(result).toEqual({ shown: 2, unknownRefs: ["r999"] });
  });

  it("opens a url only when it serves a book", async () => {
    const openInViewer = vi.fn();
    const tools = createChatTools({
      plugins: [],
      refs: new ChatRefs(),
      openInViewer,
      capabilities,
    });

    const head = (status: number, type?: string) =>
      new Response(null, {
        status,
        headers: type ? { "Content-Type": type } : {},
      });

    // A page about the book: the model should go find the file link.
    corsFetch.mockResolvedValueOnce(head(200, "text/html"));
    const page = await run(tools, "open_url", {
      url: "https://example.com/book-page",
    });
    expect(page.error).toMatch(/web page/);

    // Neither the site nor the proxy answers: the model must not retry it.
    corsFetch.mockRejectedValueOnce(new TypeError("Failed"));
    const unreachable = await run(tools, "open_url", {
      url: "https://example.com/republic.epub",
    });
    expect(unreachable.error).toMatch(/Don't retry this site/);

    corsFetch.mockResolvedValueOnce(head(503));
    const down = await run(tools, "open_url", {
      url: "https://example.com/republic.epub",
    });
    expect(down.error).toMatch(/Don't retry this site/);
    expect(openInViewer).not.toHaveBeenCalled();

    corsFetch.mockResolvedValueOnce(head(200, "application/pdf"));
    await run(tools, "open_url", { url: "https://example.com/republic.pdf" });
    expect(openInViewer).toHaveBeenCalledWith({
      source: "https://example.com/republic.pdf",
      type: "application/pdf",
    });
  });

  it("adds app-side web tools only where the provider lacks them", () => {
    const base = {
      plugins: [],
      refs: new ChatRefs(),
      openInViewer: vi.fn(),
    };
    const search = { provider: "tavily" as const, apiKey: "k" };

    const native = createChatTools({ ...base, capabilities });
    expect(native.web_search).toBeUndefined();
    expect(native.fetch_page).toBeUndefined();

    const searchOnly = createChatTools({
      ...base,
      capabilities: { nativeSearch: true, nativeFetch: false },
    });
    expect(searchOnly.web_search).toBeUndefined();
    expect(searchOnly.fetch_page).toBeDefined();

    const noWeb = { nativeSearch: false, nativeFetch: false };
    const withKey = createChatTools({ ...base, capabilities: noWeb, search });
    expect(withKey.web_search).toBeDefined();
    expect(withKey.fetch_page).toBeDefined();

    const withoutKey = createChatTools({ ...base, capabilities: noWeb });
    expect(withoutKey.web_search).toBeUndefined();
    expect(withoutKey.fetch_page).toBeUndefined();
  });
});

describe("parsePage", () => {
  it("finds book links and resolves them against the page", () => {
    const page = parsePage(
      `<html><head><title>The Republic by Plato</title></head><body>
        <script>ignored()</script>
        <p>Free ebook</p>
        <a href="/ebooks/1497.epub3.images">EPUB3 (E-readers incl. Send-to-Kindle)</a>
        <a href="files/1497.pdf">PDF</a>
        <a href="/about">About us</a>
      </body></html>`,
      "https://www.gutenberg.org/ebooks/1497"
    );
    expect(page.title).toBe("The Republic by Plato");
    expect(page.text).toContain("Free ebook");
    expect(page.text).not.toContain("ignored");
    expect(page.bookLinks.map((l) => l.url)).toEqual([
      "https://www.gutenberg.org/ebooks/1497.epub3.images",
      "https://www.gutenberg.org/ebooks/files/1497.pdf",
    ]);
  });
});
