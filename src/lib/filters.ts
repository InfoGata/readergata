import { FilterValues } from "@/plugintypes";
import { z } from "zod";

/**
 * The `filters` url search param, shared by every feed route. TanStack json
 * encodes non-string search params, so the record round trips as-is.
 *
 * Filters live in the url rather than component state so a filtered feed is
 * shareable and survives a refresh — which also means the app never has the
 * plugin's `Filter` declarations in hand on a cold load, and is why plugins are
 * sent a flat id-to-value map instead.
 */
export const filtersSearchSchema = {
  filters: z.record(z.string()).optional().catch(undefined),
};

/**
 * Drops blank values so a filter the user cleared leaves the url entirely
 * rather than pinning an empty string the plugin has to special-case.
 */
export const cleanFilterValues = (
  values: FilterValues,
): FilterValues | undefined => {
  const entries = Object.entries(values).filter(([, value]) => value !== "");
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
};

/**
 * Stable string for a set of filter values, for use as part of a react-query
 * key or an effect dependency. Key order in the url is not meaningful, so it is
 * sorted — otherwise two identical filter sets would look like different pages.
 */
export const filterKey = (values?: FilterValues): string =>
  values ? JSON.stringify(Object.entries(values).sort()) : "";
