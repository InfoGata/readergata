import { PageInfo } from "@/plugintypes";
import { z } from "zod";

/**
 * The `offset` url search param, shared by every feed route.
 *
 * The page a reader is on belongs in the url for the same reasons the filters
 * do — it survives a refresh and it can be shared — and for one more: opening
 * a publication unmounts the feed, so a page held in component state would be
 * gone by the time they came back.
 *
 * The first page leaves `offset` out entirely rather than writing `offset=0`.
 */
export const offsetSearchSchema = {
  offset: z.number().int().nonnegative().optional().catch(undefined),
};

export const hasNextPage = (pageInfo: PageInfo) =>
  pageInfo.totalResults === undefined ||
  pageInfo.offset + pageInfo.resultsPerPage < pageInfo.totalResults;

export const hasPrevPage = (pageInfo: PageInfo) => pageInfo.offset > 0;
