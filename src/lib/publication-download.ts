/**
 * The one publication transfer a reader can be waiting on, and its progress.
 *
 * Module state rather than redux or a context because of where the bytes
 * actually move: the viewer asks a plugin for a source, the plugin asks the
 * app for the url over the frame boundary, and the app fetches it. There is no
 * component between the fetch and the viewer to thread a value through.
 */

export interface DownloadProgress {
  /** Bytes received so far. */
  loaded: number;
  /** Bytes expected, when the server sent a Content-Length. */
  total?: number;
}

interface Transfer {
  /** Only this plugin's requests belong to the transfer. */
  pluginId?: string;
  controller: AbortController;
}

/** Progress updates are frequent and every one of them is a render. */
const EMIT_INTERVAL_MS = 100;

let transfer: Transfer | null = null;
let progress: DownloadProgress | null = null;
let lastEmit = 0;
/**
 * Sticky until the next transfer starts. The reader's cancellation surfaces as
 * a failed fetch, and the failure is handled after the transfer has ended, so
 * this has to outlive it -- otherwise cancelling reports itself as an error.
 */
let cancelled = false;

const listeners = new Set<() => void>();

const emit = () => {
  for (const listener of listeners) listener();
};

export const subscribeToDownload = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Stable between emissions, as `useSyncExternalStore` requires. */
export const getDownloadProgress = (): DownloadProgress | null => progress;

export const beginDownload = (pluginId?: string) => {
  transfer = { pluginId, controller: new AbortController() };
  progress = null;
  cancelled = false;
  lastEmit = 0;
  emit();
};

export const endDownload = () => {
  transfer = null;
  progress = null;
  emit();
};

export const cancelDownload = () => {
  if (!transfer) return;
  cancelled = true;
  transfer.controller.abort();
};

export const downloadWasCancelled = () => cancelled;

/**
 * The signal to give a request that is part of the current transfer, or
 * undefined for one that is not -- a feed loading elsewhere should not be
 * abortable by a cancel button the reader pressed on a book.
 */
export const downloadSignal = (pluginId?: string): AbortSignal | undefined =>
  transfer && transfer.pluginId === pluginId
    ? transfer.controller.signal
    : undefined;

/**
 * `immediate` is for the last update of a transfer, which has to land whatever
 * the throttle would say -- otherwise a download that finishes inside the
 * interval leaves the count showing an early chunk for ever.
 */
export const reportDownloadProgress = (
  next: DownloadProgress,
  immediate = false
) => {
  if (!transfer) return;
  const now = performance.now();
  if (!immediate && now - lastEmit < EMIT_INTERVAL_MS) return;
  lastEmit = now;
  progress = next;
  emit();
};

/**
 * Reads a response body, counting what goes past. The count is taken from a
 * `TransformStream` rather than by collecting chunks so the browser still
 * assembles the `Blob` itself -- gathering them in js would put the whole
 * publication back on the heap, which is what carrying blobs avoids.
 */
export const readWithProgress = async (response: Response): Promise<Blob> => {
  const header = response.headers.get("content-length");
  const total = header ? Number(header) : undefined;
  const type = response.headers.get("content-type") ?? "";
  if (!response.body) return await response.blob();

  let loaded = 0;
  const counted = response.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        loaded += chunk.byteLength;
        reportDownloadProgress({ loaded, total });
        controller.enqueue(chunk);
      },
      flush() {
        reportDownloadProgress({ loaded, total }, true);
      },
    })
  );
  // Carried over so the blob keeps the type the server gave it, as it would
  // have had from `response.blob()`.
  return await new Response(counted, {
    headers: type ? { "content-type": type } : undefined,
  }).blob();
};
