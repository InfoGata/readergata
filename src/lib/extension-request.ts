import semverGte from "semver/functions/gte";
import type { NetworkRequest, NetworkRequestOptions } from "../types";

/**
 * The first extension version that streams responses: no size limit, progress
 * through `onProgress`, cancelling through `init.signal`.
 */
export const STREAMING_EXTENSION_VERSION = "1.6.0";

let streamingSupport: Promise<boolean> | undefined;

/**
 * Whether the installed extension takes `onProgress` and a signal. Asked
 * once: an older extension fails any request whose options carry a function,
 * since it posts them to its content script and a function can't be posted.
 */
export const extensionStreams = (): Promise<boolean> => {
  streamingSupport ??= (async () => {
    try {
      const version = await window.InfoGata?.getVersion?.();
      return !!version && semverGte(version, STREAMING_EXTENSION_VERSION);
    } catch {
      return false;
    }
  })();
  return streamingSupport;
};

/** Forgets the answer; for tests, which swap extensions between cases. */
export const resetExtensionStreamingCache = () => {
  streamingSupport = undefined;
};

export interface ExtensionProgress {
  loaded: number;
  total?: number;
}

/**
 * `InfoGata.networkRequest`, passing the signal and progress callback on only
 * to an extension that understands them. With an older one the request still
 * works, just without progress, and cancelling only discards the answer.
 */
export const extensionNetworkRequest = async (
  input: string,
  init: RequestInit | undefined,
  options: NetworkRequestOptions | undefined,
  extras: {
    signal?: AbortSignal;
    onProgress?: (progress: ExtensionProgress) => void;
  } = {}
): Promise<NetworkRequest> => {
  const { signal: initSignal, ...rest } = init ?? {};
  const signal = extras.signal ?? initSignal ?? undefined;
  signal?.throwIfAborted();

  if (await extensionStreams()) {
    const result = await window.InfoGata.networkRequest(
      input,
      { ...rest, signal },
      extras.onProgress
        ? { ...options, onProgress: extras.onProgress }
        : options
    );
    return result;
  }

  const result = await window.InfoGata.networkRequest(input, rest, options);
  signal?.throwIfAborted();
  return result;
};
