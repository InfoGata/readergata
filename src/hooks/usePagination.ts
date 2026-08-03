import React from "react";
import { PageInfo, PageRequest } from "../plugintypes";

type UsePaginationArgs = {
  /** Offset from the url. Undefined is the first page. */
  offset?: number;
  /**
   * Navigates to a new offset. A navigation rather than a setState, so the
   * back button walks back through pages, and so a reader returning from a
   * publication lands on the page they left.
   */
  onOffsetChange: (offset?: number) => void;
};

/**
 * Turns the offset in the url into the page to ask a plugin for.
 *
 * The first request sends `undefined` so the plugin picks its own page size,
 * then reports back what it used in the feed's `pageInfo`. Next/previous are
 * derived from that returned page, not from state we guessed at — which is
 * also why a link straight into page four carries no `resultsPerPage`.
 */
const usePagination = ({ offset, onOffsetChange }: UsePaginationArgs) => {
  const pageInfo: PageRequest | undefined =
    offset === undefined ? undefined : { offset };

  const nextPage = React.useCallback(
    (current: PageInfo) =>
      onOffsetChange(current.offset + current.resultsPerPage),
    [onOffsetChange]
  );

  const prevPage = React.useCallback(
    (current: PageInfo) => {
      const previous = Math.max(0, current.offset - current.resultsPerPage);
      // Back at the start means back to a url with no offset on it at all.
      onOffsetChange(previous === 0 ? undefined : previous);
    },
    [onOffsetChange]
  );

  return { pageInfo, nextPage, prevPage };
};

export default usePagination;
