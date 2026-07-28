import { pluginIdParams } from "@/lib/plugin-route";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

const feedSearchSchema = z.object({
  query: z.string().optional().catch(undefined),
  apiId: z.string().optional().catch(undefined),
  searchInfo: z.string().optional().catch(undefined),
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
