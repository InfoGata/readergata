import { tool, type ToolSet } from "ai";
import { z } from "zod";
import type { PluginFrameContainer } from "../../contexts/PluginsContext";
import type { PublicationSource } from "../../plugintypes";
import { corsFetch, isCorrectMimeType } from "../../utils";
import { EBOOK_ACCEPTED_MIME_TYPES, PDF_MIME_TYPE, isPdfName } from "../ebook";
import type { ChatCapabilities } from "./config";
import type { ChatRefs, ViewerTarget } from "./refs";
import { fetchPage, webSearch, type WebSearchConfig } from "./search";

const PLUGIN_TIMEOUT_MS = 15_000;
const MAX_RESULTS_PER_PLUGIN = 8;
const EPUB_MIME_TYPE = "application/epub+zip";

export interface ChatToolsOptions {
  plugins: PluginFrameContainer[];
  refs: ChatRefs;
  openInViewer: (target: ViewerTarget) => void;
  capabilities: ChatCapabilities;
  search?: WebSearchConfig;
}

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timed out")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });

const describeSource = (
  refs: ChatRefs,
  pluginId: string,
  title: string,
  source: PublicationSource
) => ({
  ref: refs.add({ kind: "source", pluginId, title, source }, "s"),
  name: source.name,
  format: source.type,
  acquisition: source.acquisitionType,
  size: source.size,
  price:
    source.price !== undefined
      ? `${source.price} ${source.currency ?? ""}`.trim()
      : undefined,
});

export const searchPlugins = async (
  plugins: PluginFrameContainer[],
  refs: ChatRefs,
  query: string,
  pluginIds?: string[]
) => {
  const candidates = plugins.filter(
    (p) => !pluginIds?.length || pluginIds.includes(p.id ?? "")
  );
  const results = await Promise.all(
    candidates.map(async (plugin) => {
      const pluginId = plugin.id ?? "";
      try {
        if (
          !(await withTimeout(plugin.hasDefined.onSearch(), PLUGIN_TIMEOUT_MS))
        ) {
          return undefined;
        }
        const feed = await withTimeout(
          plugin.remote.onSearch({ query }),
          PLUGIN_TIMEOUT_MS
        );
        if (feed.type !== "publication") {
          return {
            plugin: plugin.name,
            pluginId,
            note: "Returned catalogs rather than books",
            catalogs: feed.items.slice(0, 5).map((c) => c.name),
            results: [],
          };
        }
        return {
          plugin: plugin.name,
          pluginId,
          results: feed.items.slice(0, MAX_RESULTS_PER_PLUGIN).map((pub) => ({
            ref: refs.add({ kind: "publication", pluginId, publication: pub }),
            title: pub.title,
            authors: pub.authors?.map((a) => a.name),
            publisher: pub.publisher,
            published: pub.published,
            languages: pub.languages,
            sources: pub.sources?.map((s) =>
              describeSource(refs, pluginId, pub.title, s)
            ),
            // Without sources, get_publication fetches them.
            hasDetails: !pub.sources?.length && !!pub.apiId,
          })),
        };
      } catch (error) {
        return {
          plugin: plugin.name,
          pluginId,
          error: error instanceof Error ? error.message : String(error),
          results: [],
        };
      }
    })
  );
  const searched = results.filter((r) => r !== undefined);
  return {
    searchedPlugins: searched.length,
    plugins: searched,
  };
};

const UNREACHABLE =
  "The app couldn't download from this address: the site refuses requests from the app, or is down. Don't retry this site. Try a different source, or tell the user what you found and that it can't be opened from here.";

/**
 * Why a url can't be opened as a book, or undefined if it can. Tells the
 * model apart a page from an unreachable site: told only "not a book", it
 * keeps retrying a site the browser can't reach.
 */
export const checkBookUrl = async (
  url: string,
  signal?: AbortSignal
): Promise<string | undefined> => {
  let response: Response;
  try {
    response = await corsFetch(url, { method: "HEAD", signal });
  } catch {
    return UNREACHABLE;
  }
  // Some servers answer HEAD with 404 or 405 but serve the file to GET, so
  // only a server error counts against the url here.
  if (response.status >= 500) return UNREACHABLE;
  if (
    response.ok &&
    !isCorrectMimeType(response, [...EBOOK_ACCEPTED_MIME_TYPES, PDF_MIME_TYPE])
  ) {
    return "That URL is a web page, not an EPUB or PDF file. Fetch the page and find the direct download link.";
  }
  return undefined;
};

export const createChatTools = (options: ChatToolsOptions): ToolSet => {
  const { plugins, refs, openInViewer, capabilities, search } = options;

  const tools: ToolSet = {
    search_plugins: tool({
      description:
        "Search the user's installed ReaderGata plugins (their own book sources) for a book. Returns results with refs. Each result's sources are downloadable files you can open with open_publication; results with hasDetails=true need get_publication first.",
      inputSchema: z.object({
        query: z
          .string()
          .describe("Search terms, usually the title and optionally author"),
        pluginIds: z
          .array(z.string())
          .optional()
          .describe("Only search these plugins; omit to search all"),
      }),
      execute: ({ query, pluginIds }) =>
        searchPlugins(plugins, refs, query, pluginIds),
    }),

    get_publication: tool({
      description:
        "Get the downloadable sources for a search_plugins result that has hasDetails=true.",
      inputSchema: z.object({
        ref: z.string().describe("A publication ref from search_plugins"),
      }),
      execute: async ({ ref }) => {
        const entry = refs.get(ref);
        if (entry?.kind !== "publication") {
          return { error: `Unknown publication ref ${ref}` };
        }
        const plugin = plugins.find((p) => p.id === entry.pluginId);
        const apiId = entry.publication.apiId;
        if (!plugin || !apiId) {
          return { error: "This result has no details to fetch" };
        }
        if (!(await plugin.hasDefined.onGetPublicationDetails())) {
          return { error: "The plugin can't fetch details" };
        }
        const details = await withTimeout(
          plugin.remote.onGetPublicationDetails({ apiId }),
          PLUGIN_TIMEOUT_MS
        );
        return {
          title: details.title,
          authors: details.authors?.map((a) => a.name),
          sources: (details.sources ?? []).map((s) =>
            describeSource(refs, entry.pluginId, details.title, s)
          ),
        };
      },
    }),

    open_publication: tool({
      description:
        "Open a book file from a plugin in the reader. Takes a source ref (starting with 's') from search_plugins or get_publication.",
      inputSchema: z.object({
        ref: z.string().describe("A source ref"),
      }),
      execute: async ({ ref }) => {
        const entry = refs.get(ref);
        if (entry?.kind !== "source") {
          return {
            error: `${ref} is not a source ref. Use a ref starting with 's'.`,
          };
        }
        openInViewer({
          pluginId: entry.pluginId,
          source: entry.source.source,
          type: entry.source.type,
        });
        return { opened: true, title: entry.title };
      },
    }),

    show_options: tool({
      description:
        "Show the user up to five candidate books as cards they can open themselves. Use it when asking the user to choose. Plugin results are passed as refs (publication or source refs); web files as links.",
      inputSchema: z.object({
        refs: z
          .array(z.string())
          .max(5)
          .optional()
          .describe("Refs from search_plugins or get_publication"),
        links: z
          .array(
            z.object({
              title: z.string(),
              url: z.string().url().describe("A direct EPUB or PDF link"),
            })
          )
          .max(5)
          .optional(),
      }),
      execute: async ({ refs: ids = [], links = [] }) => {
        const unknown = ids.filter((id) => !refs.get(id));
        return {
          shown: ids.length - unknown.length + links.length,
          ...(unknown.length ? { unknownRefs: unknown } : {}),
        };
      },
    }),

    open_url: tool({
      description:
        "Open an EPUB or PDF file at a URL in the reader. The URL must point at the file itself, not a web page about the book.",
      inputSchema: z.object({
        url: z.string().url(),
        title: z.string().optional().describe("The book's title"),
        format: z.enum(["epub", "pdf"]).optional(),
      }),
      execute: async ({ url, title, format }, { abortSignal }) => {
        const problem = await checkBookUrl(url, abortSignal);
        if (problem) return { error: problem };
        const isPdf = format === "pdf" || (!format && isPdfName(url));
        openInViewer({
          source: url,
          type: isPdf ? PDF_MIME_TYPE : EPUB_MIME_TYPE,
        });
        return { opened: true, title };
      },
    }),
  };

  if (!capabilities.nativeSearch && search) {
    tools.web_search = tool({
      description:
        "Search the web. Returns titles, URLs and snippets of matching pages.",
      inputSchema: z.object({ query: z.string() }),
      execute: async ({ query }, { abortSignal }) => ({
        results: await webSearch(query, search, abortSignal),
      }),
    });
  }

  if (!capabilities.nativeFetch && (capabilities.nativeSearch || search)) {
    tools.fetch_page = tool({
      description:
        "Fetch a web page to find a book's download link. Returns the page's text and the links on it that look like book files.",
      inputSchema: z.object({ url: z.string().url() }),
      execute: ({ url }, { abortSignal }) => fetchPage(url, abortSignal),
    });
  }

  return tools;
};
