import type { ChatSearchProvider } from "../../store/reducers/settingsReducer";
import { corsFetch } from "../../utils";

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface WebSearchConfig {
  provider: ChatSearchProvider;
  apiKey: string;
}

const MAX_RESULTS = 8;

const searchTavily = async (
  query: string,
  apiKey: string,
  signal?: AbortSignal
): Promise<WebSearchResult[]> => {
  const response = await corsFetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, max_results: MAX_RESULTS }),
    signal,
  });
  if (!response.ok) {
    throw new Error(`Tavily search failed (${response.status})`);
  }
  const json = (await response.json()) as {
    results?: { title?: string; url: string; content?: string }[];
  };
  return (json.results ?? []).map((r) => ({
    title: r.title ?? r.url,
    url: r.url,
    snippet: r.content ?? "",
  }));
};

const searchBrave = async (
  query: string,
  apiKey: string,
  signal?: AbortSignal
): Promise<WebSearchResult[]> => {
  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(MAX_RESULTS));
  // Brave sends no CORS headers, so in a plain browser this goes through the
  // proxy; with the extension, Electron or native it works directly.
  const response = await corsFetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "X-Subscription-Token": apiKey,
    },
    signal,
  });
  if (!response.ok) {
    throw new Error(`Brave search failed (${response.status})`);
  }
  const json = (await response.json()) as {
    web?: { results?: { title?: string; url: string; description?: string }[] };
  };
  return (json.web?.results ?? []).map((r) => ({
    title: r.title ?? r.url,
    url: r.url,
    snippet: r.description ?? "",
  }));
};

export const webSearch = (
  query: string,
  config: WebSearchConfig,
  signal?: AbortSignal
): Promise<WebSearchResult[]> => {
  switch (config.provider) {
    case "tavily":
      return searchTavily(query, config.apiKey, signal);
    case "brave":
      return searchBrave(query, config.apiKey, signal);
  }
};

const BOOK_LINK = /\.(epub|pdf|mobi|azw3|fb2|cbz)(\?|#|$)|download|epub/i;
const MAX_TEXT = 8000;
const MAX_LINKS = 40;

export interface FetchedPage {
  url: string;
  title: string;
  text: string;
  /** Links that look like they lead to a book file. */
  bookLinks: { text: string; url: string }[];
}

/** Pulls the parts of an html page a model needs to find a download link. */
export const parsePage = (html: string, baseUrl: string): FetchedPage => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc
    .querySelectorAll("script, style, noscript, svg")
    .forEach((el) => el.remove());
  const bookLinks: FetchedPage["bookLinks"] = [];
  const seen = new Set<string>();
  doc.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || bookLinks.length >= MAX_LINKS) return;
    let absolute: string;
    try {
      absolute = new URL(href, baseUrl).toString();
    } catch {
      return;
    }
    const text = (a.textContent ?? "").replace(/\s+/g, " ").trim();
    if (seen.has(absolute)) return;
    if (BOOK_LINK.test(absolute) || BOOK_LINK.test(text)) {
      seen.add(absolute);
      bookLinks.push({ text: text.slice(0, 100), url: absolute });
    }
  });
  const text = (doc.body?.textContent ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TEXT);
  return {
    url: baseUrl,
    title: doc.title,
    text,
    bookLinks,
  };
};

export const fetchPage = async (
  url: string,
  signal?: AbortSignal
): Promise<FetchedPage | { error: string; contentType?: string }> => {
  const response = await corsFetch(url, { signal });
  if (!response.ok) {
    return { error: `Request failed with status ${response.status}` };
  }
  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("html") && !contentType.includes("xml")) {
    return {
      error:
        "Not a web page. If this is a book file, open it with open_url instead.",
      contentType,
    };
  }
  return parsePage(await response.text(), url);
};
