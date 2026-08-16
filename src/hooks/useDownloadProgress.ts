import React from "react";
import {
  DownloadProgress,
  getDownloadProgress,
  subscribeToDownload,
} from "../lib/publication-download";

/**
 * Below this a download is over before a reader could read the number, and a
 * panel that appears and vanishes is worse than the spinner it replaced.
 */
const VISIBLE_FROM_BYTES = 1_000_000;

const isWorthShowing = (progress: DownloadProgress | null) =>
  progress !== null && (progress.total ?? progress.loaded) >= VISIBLE_FROM_BYTES;

/** The current publication transfer, once it is large enough to report. */
const useDownloadProgress = (): DownloadProgress | null => {
  const progress = React.useSyncExternalStore(
    subscribeToDownload,
    getDownloadProgress
  );
  return isWorthShowing(progress) ? progress : null;
};

export default useDownloadProgress;
