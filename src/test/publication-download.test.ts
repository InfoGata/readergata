import { afterEach, describe, expect, it, vi } from "vitest";
import {
  beginDownload,
  cancelDownload,
  downloadSignal,
  downloadWasCancelled,
  endDownload,
  getDownloadProgress,
  readWithProgress,
  reportDownloadProgress,
  subscribeToDownload,
} from "@/lib/publication-download";

afterEach(() => {
  endDownload();
});

describe("downloadSignal", () => {
  it("gives nothing when no publication is being fetched", () => {
    expect(downloadSignal("plugin")).toBeUndefined();
  });

  it("gives nothing to a plugin that is not the one fetching", () => {
    beginDownload("fetching");
    expect(downloadSignal("someone-else")).toBeUndefined();
  });

  it("gives the transfer's signal to the plugin fetching it", () => {
    beginDownload("fetching");
    expect(downloadSignal("fetching")).toBeInstanceOf(AbortSignal);
  });

  it("stops giving it out once the transfer ends", () => {
    beginDownload("fetching");
    endDownload();
    expect(downloadSignal("fetching")).toBeUndefined();
  });
});

describe("cancelDownload", () => {
  it("aborts the signal the request was given", () => {
    beginDownload("fetching");
    const signal = downloadSignal("fetching");
    cancelDownload();
    expect(signal?.aborted).toBe(true);
  });

  it("stays reported after the transfer ends, so the failure it causes can be told apart", () => {
    beginDownload("fetching");
    cancelDownload();
    endDownload();
    expect(downloadWasCancelled()).toBe(true);
  });

  it("does not carry into the next transfer", () => {
    beginDownload("fetching");
    cancelDownload();
    endDownload();
    beginDownload("fetching");
    expect(downloadWasCancelled()).toBe(false);
  });

  it("does nothing when there is no transfer", () => {
    expect(() => cancelDownload()).not.toThrow();
    expect(downloadWasCancelled()).toBe(false);
  });
});

describe("reportDownloadProgress", () => {
  it("is ignored outside a transfer", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToDownload(listener);
    reportDownloadProgress({ loaded: 10, total: 100 });
    expect(getDownloadProgress()).toBeNull();
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it("throttles updates that arrive on top of one another", () => {
    beginDownload("fetching");
    reportDownloadProgress({ loaded: 50, total: 100 });
    reportDownloadProgress({ loaded: 60, total: 100 });
    expect(getDownloadProgress()).toEqual({ loaded: 50, total: 100 });
  });

  it("lets an immediate update through the throttle", () => {
    beginDownload("fetching");
    reportDownloadProgress({ loaded: 50, total: 100 });
    reportDownloadProgress({ loaded: 100, total: 100 }, true);
    expect(getDownloadProgress()).toEqual({ loaded: 100, total: 100 });
  });

  it("clears when the transfer ends", () => {
    beginDownload("fetching");
    reportDownloadProgress({ loaded: 100, total: 100 });
    endDownload();
    expect(getDownloadProgress()).toBeNull();
  });
});

describe("readWithProgress", () => {
  const bytes = new Uint8Array(Array.from({ length: 4096 }, (_, i) => i % 256));

  /** In chunks, so the counting is exercised more than once. */
  const streamOf = (body: Uint8Array) =>
    new ReadableStream<Uint8Array>({
      start(controller) {
        for (let at = 0; at < body.length; at += 1024) {
          controller.enqueue(body.subarray(at, at + 1024));
        }
        controller.close();
      },
    });

  const responseOf = (body: Uint8Array, withLength = true) =>
    new Response(streamOf(body), {
      headers: {
        "content-type": "application/epub+zip",
        ...(withLength ? { "content-length": String(body.length) } : {}),
      },
    });

  it("returns the body unchanged", async () => {
    beginDownload("fetching");
    const blob = await readWithProgress(responseOf(bytes));
    expect(blob.size).toBe(bytes.length);
    expect(Array.from(new Uint8Array(await blob.arrayBuffer()))).toEqual(
      Array.from(bytes)
    );
  });

  it("keeps the type the server sent", async () => {
    beginDownload("fetching");
    const blob = await readWithProgress(responseOf(bytes));
    expect(blob.type).toBe("application/epub+zip");
  });

  it("counts every byte that went past", async () => {
    beginDownload("fetching");
    await readWithProgress(responseOf(bytes));
    expect(getDownloadProgress()).toEqual({
      loaded: bytes.length,
      total: bytes.length,
    });
  });

  it("still counts when the server sent no length to measure against", async () => {
    beginDownload("fetching");
    await readWithProgress(responseOf(bytes, false));
    expect(getDownloadProgress()).toEqual({
      loaded: bytes.length,
      total: undefined,
    });
  });
});
