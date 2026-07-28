import { pluginIdParams } from "@/lib/plugin-route";
import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Content moved to `/s`. These urls are out in the wild — shared links,
 * bookmarks, extension redirects — so forward them, resolving an alias or a
 * plugin id either way.
 */
export const Route = createFileRoute("/plugins/$pluginId/feed/")({
  params: pluginIdParams(),
  beforeLoad: ({ params, location }) => {
    throw redirect({
      to: "/s/$pluginId/feed",
      params: { pluginId: params.pluginId },
      search: location.search,
      replace: true,
    });
  },
});
