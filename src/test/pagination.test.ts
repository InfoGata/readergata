import usePagination from "@/hooks/usePagination";
import { hasNextPage, hasPrevPage } from "@/lib/pagination";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const setup = (offset?: number) => {
  const onOffsetChange = vi.fn();
  const { result } = renderHook(() =>
    usePagination({ offset, onOffsetChange })
  );
  return { result, onOffsetChange };
};

describe("usePagination", () => {
  it("asks for no particular page when the url carries no offset", () => {
    const { result } = setup();
    expect(result.current.pageInfo).toBeUndefined();
  });

  it("asks for the offset in the url", () => {
    const { result } = setup(50);
    expect(result.current.pageInfo).toEqual({ offset: 50 });
  });

  it("advances by the page size the plugin reported", () => {
    const { result, onOffsetChange } = setup(0);
    result.current.nextPage({ offset: 0, resultsPerPage: 25 });
    expect(onOffsetChange).toHaveBeenCalledWith(25);
  });

  it("goes back by the page size the plugin reported", () => {
    const { result, onOffsetChange } = setup(50);
    result.current.prevPage({ offset: 50, resultsPerPage: 25 });
    expect(onOffsetChange).toHaveBeenCalledWith(25);
  });

  it("drops the offset entirely on the way back to the first page", () => {
    const { result, onOffsetChange } = setup(25);
    result.current.prevPage({ offset: 25, resultsPerPage: 25 });
    expect(onOffsetChange).toHaveBeenCalledWith(undefined);
  });

  it("clamps a partial page back to the first page", () => {
    const { result, onOffsetChange } = setup(10);
    result.current.prevPage({ offset: 10, resultsPerPage: 25 });
    expect(onOffsetChange).toHaveBeenCalledWith(undefined);
  });
});

describe("hasNextPage", () => {
  it("assumes there is more when the total is unknown", () => {
    expect(hasNextPage({ offset: 0, resultsPerPage: 25 })).toBe(true);
  });

  it("is false on the last page", () => {
    expect(
      hasNextPage({ offset: 75, resultsPerPage: 25, totalResults: 100 })
    ).toBe(false);
  });

  it("is true with results still to come", () => {
    expect(
      hasNextPage({ offset: 50, resultsPerPage: 25, totalResults: 100 })
    ).toBe(true);
  });
});

describe("hasPrevPage", () => {
  it("is false on the first page", () => {
    expect(hasPrevPage({ offset: 0, resultsPerPage: 25 })).toBe(false);
  });

  it("is true anywhere else", () => {
    expect(hasPrevPage({ offset: 25, resultsPerPage: 25 })).toBe(true);
  });
});
