import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { InfoGataExtension, NetworkRequest } from "../types";
import { resetExtensionStreamingCache } from "../lib/extension-request";
import {
  corsFetchWithRoute,
  getPdfFile,
  networkRequestToResponse,
  toProxyUrl,
} from "../utils";

const fetchMock = vi.fn();
const networkRequest = vi.fn();

// ArrayBuffer rather than Blob: jsdom's Blob isn't the class Node's Response
// knows, so it would be read as "[object Blob]". Browsers have only one.
const bytes = (text: string) => new TextEncoder().encode(text).buffer;

const corsRefusal = () => Promise.reject(new TypeError("Failed to fetch"));

const answer = (
  status: number,
  headers: Record<string, string> = {},
  body: ArrayBuffer | null = null
): NetworkRequest => ({
  status,
  statusText: "",
  headers,
  body,
  url: "",
});

/** Without a version, an extension from before streaming (1.6.0). */
const installExtension = (version?: string) => {
  window.InfoGata = {
    networkRequest,
    ...(version ? { getVersion: async () => version } : {}),
  } as unknown as InfoGataExtension;
};

beforeEach(() => {
  resetExtensionStreamingCache();
  fetchMock.mockReset();
  networkRequest.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete (window as Partial<Window>).InfoGata;
});

describe("corsFetchWithRoute", () => {
  const url = "https://www.gutenberg.org/ebooks/1497.epub3.images";

  it("uses a direct request when the site allows it", async () => {
    installExtension();
    fetchMock.mockResolvedValueOnce(new Response("ok"));

    const result = await corsFetchWithRoute(url);

    expect(result.route).toBe("direct");
    expect(networkRequest).not.toHaveBeenCalled();
  });

  it("asks the extension when the site refuses CORS", async () => {
    installExtension();
    fetchMock.mockImplementationOnce(corsRefusal);
    networkRequest.mockResolvedValueOnce(
      answer(200, { "content-type": "application/epub+zip" }, bytes("book"))
    );
    const controller = new AbortController();

    const result = await corsFetchWithRoute(url, {
      method: "GET",
      signal: controller.signal,
    });

    expect(result.route).toBe("extension");
    expect(result.url).toBe(url);
    expect(result.response.headers.get("content-type")).toBe(
      "application/epub+zip"
    );
    expect(await result.response.text()).toBe("book");
    // An extension before 1.6.0 takes no signal.
    expect(networkRequest).toHaveBeenCalledWith(
      url,
      { method: "GET" },
      undefined
    );
    // The proxy was never needed.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("lets a streaming extension cancel the download itself", async () => {
    installExtension("1.6.0");
    fetchMock.mockImplementationOnce(corsRefusal);
    networkRequest.mockResolvedValueOnce(answer(200, {}, bytes("book")));
    const controller = new AbortController();

    await corsFetchWithRoute(url, { signal: controller.signal });

    expect(networkRequest).toHaveBeenCalledWith(
      url,
      { signal: controller.signal },
      undefined
    );
  });

  it("falls back to the proxy when the extension fails", async () => {
    installExtension();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    fetchMock
      .mockImplementationOnce(corsRefusal)
      .mockResolvedValueOnce(new Response("via proxy"));
    // e.g. a file past chrome's 64 MiB message limit.
    networkRequest.mockRejectedValueOnce(new Error("Message length exceeded"));

    const result = await corsFetchWithRoute(url);

    expect(result.route).toBe("proxy");
    expect(fetchMock).toHaveBeenLastCalledWith(toProxyUrl(url), undefined);
  });

  it("goes straight to the proxy without the extension", async () => {
    fetchMock
      .mockImplementationOnce(corsRefusal)
      .mockResolvedValueOnce(new Response("via proxy"));

    const result = await corsFetchWithRoute(url);

    expect(result.route).toBe("proxy");
    expect(result.url).toBe(toProxyUrl(url));
  });

  it("doesn't try other routes once the request is cancelled", async () => {
    installExtension();
    const controller = new AbortController();
    fetchMock.mockImplementationOnce(() => {
      controller.abort();
      return Promise.reject(new DOMException("Aborted", "AbortError"));
    });

    await expect(
      corsFetchWithRoute(url, { signal: controller.signal })
    ).rejects.toThrow();
    expect(networkRequest).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("networkRequestToResponse", () => {
  it("drops the body of a status that can't have one", () => {
    const response = networkRequestToResponse(answer(204, {}, bytes("x")));
    expect(response.status).toBe(204);
    expect(response.body).toBeNull();
  });
});

describe("getPdfFile", () => {
  const url = "https://example.com/republic.pdf";
  const pdfHeaders = { "content-type": "application/pdf" };

  it("gives react-pdf the url when it can fetch it itself", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(null, { headers: pdfHeaders })
    );
    expect(await getPdfFile(url)).toBe(url);
  });

  it("gives react-pdf the whole file when only the extension can reach it", async () => {
    installExtension();
    fetchMock.mockImplementation(corsRefusal);
    networkRequest
      .mockResolvedValueOnce(answer(200, pdfHeaders))
      .mockResolvedValueOnce(answer(200, pdfHeaders, bytes("%PDF-1.7")));

    const file = await getPdfFile(url);

    expect(typeof file).toBe("object");
    expect(await (file as Blob).text()).toBe("%PDF-1.7");
  });

  it("refuses something that isn't a PDF", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(null, { headers: { "content-type": "text/html" } })
    );
    expect(await getPdfFile(url)).toBeNull();
  });
});
