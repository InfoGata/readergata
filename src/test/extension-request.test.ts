import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  extensionNetworkRequest,
  extensionStreams,
  resetExtensionStreamingCache,
} from "../lib/extension-request";
import type { InfoGataExtension, NetworkRequest } from "../types";

const networkRequest = vi.fn();
const getVersion = vi.fn();

const ok: NetworkRequest = {
  body: null,
  headers: {},
  status: 200,
  statusText: "OK",
  url: "https://example.com/book.epub",
};

const install = (version: string | undefined) => {
  getVersion.mockResolvedValue(version);
  window.InfoGata = {
    networkRequest,
    ...(version === undefined ? {} : { getVersion }),
  } as unknown as InfoGataExtension;
};

beforeEach(() => {
  resetExtensionStreamingCache();
  networkRequest.mockReset().mockResolvedValue(ok);
  getVersion.mockReset();
});

afterEach(() => {
  delete (window as Partial<Window>).InfoGata;
});

describe("extensionStreams", () => {
  it("is true from 1.6.0 on", async () => {
    install("1.6.0");
    expect(await extensionStreams()).toBe(true);
    resetExtensionStreamingCache();
    install("1.10.2");
    expect(await extensionStreams()).toBe(true);
  });

  it("is false for older extensions, and ones that can't say", async () => {
    install("1.5.1");
    expect(await extensionStreams()).toBe(false);
    resetExtensionStreamingCache();
    install(undefined);
    expect(await extensionStreams()).toBe(false);
  });

  it("asks the extension once", async () => {
    install("1.6.0");
    await extensionStreams();
    await extensionStreams();
    expect(getVersion).toHaveBeenCalledTimes(1);
  });
});

describe("extensionNetworkRequest", () => {
  const url = "https://example.com/book.epub";

  it("hands a streaming extension the signal and the progress callback", async () => {
    install("1.6.0");
    const controller = new AbortController();
    const onProgress = vi.fn();

    await extensionNetworkRequest(
      url,
      { method: "GET" },
      { auth: undefined },
      { signal: controller.signal, onProgress }
    );

    expect(networkRequest).toHaveBeenCalledWith(
      url,
      { method: "GET", signal: controller.signal },
      { auth: undefined, onProgress }
    );
  });

  it("keeps both away from an older extension, which would fail on them", async () => {
    install("1.5.1");
    const controller = new AbortController();

    await extensionNetworkRequest(
      url,
      { method: "GET", signal: controller.signal },
      { auth: undefined },
      { onProgress: vi.fn() }
    );

    expect(networkRequest).toHaveBeenCalledWith(
      url,
      { method: "GET" },
      { auth: undefined }
    );
  });

  it("drops an older extension's answer once cancelled", async () => {
    install("1.5.1");
    const controller = new AbortController();
    networkRequest.mockImplementation(async () => {
      controller.abort();
      return ok;
    });

    await expect(
      extensionNetworkRequest(url, { signal: controller.signal }, undefined)
    ).rejects.toThrow();
  });

  it("doesn't start a request that is already cancelled", async () => {
    install("1.6.0");

    await expect(
      extensionNetworkRequest(url, { signal: AbortSignal.abort() }, undefined)
    ).rejects.toThrow();
    expect(networkRequest).not.toHaveBeenCalled();
  });
});
