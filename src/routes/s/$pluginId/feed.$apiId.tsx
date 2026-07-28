import PluginFeed from "@/components/PluginFeed";
import { canonicalizePluginUrl, pluginIdParams } from "@/lib/plugin-route";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

const FeedApiId: React.FC = () => {
  const { pluginId, apiId } = Route.useParams();
  return <PluginFeed pluginId={pluginId} apiId={decodeURIComponent(apiId)} />;
};

export const Route = createFileRoute("/s/$pluginId/feed/$apiId")({
  params: pluginIdParams<{ apiId: string }>(),
  beforeLoad: canonicalizePluginUrl,
  component: FeedApiId,
});
