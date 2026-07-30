import React from "react";
import { PageInfo } from "../plugintypes";

/**
 * Tracks which page to ask a plugin for.
 *
 * The first request sends `undefined` so the plugin picks its own page size,
 * then reports back what it used in the feed's `pageInfo`. Next/previous are
 * derived from that returned page, not from state we guessed at.
 */
const usePagination = () => {
  const [pageInfo, setPageInfo] = React.useState<PageInfo>();

  const nextPage = React.useCallback((current: PageInfo) => {
    setPageInfo({
      ...current,
      offset: current.offset + current.resultsPerPage,
    });
  }, []);

  const prevPage = React.useCallback((current: PageInfo) => {
    setPageInfo({
      ...current,
      offset: Math.max(0, current.offset - current.resultsPerPage),
    });
  }, []);

  const reset = React.useCallback(() => setPageInfo(undefined), []);

  return { pageInfo, nextPage, prevPage, reset };
};

export const hasNextPage = (pageInfo: PageInfo) =>
  pageInfo.totalResults === undefined ||
  pageInfo.offset + pageInfo.resultsPerPage < pageInfo.totalResults;

export const hasPrevPage = (pageInfo: PageInfo) => pageInfo.offset > 0;

export default usePagination;
