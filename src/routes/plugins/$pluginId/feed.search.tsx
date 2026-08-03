import { filtersSearchSchema } from "@/lib/filters";
import { offsetSearchSchema } from "@/lib/pagination";
import { pluginIdParams } from "@/lib/plugin-route";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

/**
 * Mirrors the schema on `/s/$pluginId/feed/search`. Anything missing here is
 * dropped on the way through, so the two have to stay in step.
 */
const feedSearchSchema = z.object({
  query: z.string().optional().catch(undefined),
  apiId: z.string().optional().catch(undefined),
  searchInfo: z.string().optional().catch(undefined),
  ...filtersSearchSchema,
  ...offsetSearchSchema,
});

/** Forwards the old search url to `/s`, keeping the query intact. */
export const Route = createFileRoute("/plugins/$pluginId/feed/search")({
  params: pluginIdParams(),
  validateSearch: feedSearchSchema,
  beforeLoad: ({ params, search }) => {
    throw redirect({
      to: "/s/$pluginId/feed/search",
      params: { pluginId: params.pluginId },
      search,
      replace: true,
    });
  },
});
