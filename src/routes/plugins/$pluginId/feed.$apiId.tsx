import { pluginIdParams } from "@/lib/plugin-route";
import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Forwards the old content url to `/s`. `apiId` is passed through verbatim:
 * these are catalog urls that callers already encodeURIComponent, and
 * interpolatePath re-encodes symmetrically on the way back out.
 */
export const Route = createFileRoute("/plugins/$pluginId/feed/$apiId")({
  params: pluginIdParams<{ apiId: string }>(),
  beforeLoad: ({ params, location }) => {
    throw redirect({
      to: "/s/$pluginId/feed/$apiId",
      params: { pluginId: params.pluginId, apiId: params.apiId },
      search: location.search,
      replace: true,
    });
  },
});
