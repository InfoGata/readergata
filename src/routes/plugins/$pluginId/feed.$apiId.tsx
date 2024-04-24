import PluginFeed from "@/components/PluginFeed";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

const FeedApiId: React.FC = () => {
  const { pluginId, apiId } = Route.useParams();
  return <PluginFeed pluginId={pluginId} apiId={decodeURIComponent(apiId)} />;
};

export const Route = createFileRoute("/plugins/$pluginId/feed/$apiId")({
  component: FeedApiId,
});
