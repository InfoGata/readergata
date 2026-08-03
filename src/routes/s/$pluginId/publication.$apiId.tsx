import PublicationDetails from "@/components/PublicationDetails";
import { canonicalizePluginUrl, pluginIdParams } from "@/lib/plugin-route";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import React from "react";

const PublicationPage: React.FC = () => {
  const { pluginId, apiId } = Route.useParams();
  // Set by the feed row that linked here, so the page can paint before the
  // plugin answers. Absent on a shared link or a refresh.
  const publicationFromFeed = useRouterState({
    select: (state) => state.location.state.publication,
  });

  return (
    <PublicationDetails
      pluginId={pluginId}
      apiId={decodeURIComponent(apiId)}
      publicationFromFeed={publicationFromFeed}
    />
  );
};

export const Route = createFileRoute("/s/$pluginId/publication/$apiId")({
  params: pluginIdParams<{ apiId: string }>(),
  beforeLoad: canonicalizePluginUrl,
  component: PublicationPage,
});
