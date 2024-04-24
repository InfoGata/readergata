import PluginFeed from "@/components/PluginFeed";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

const FeedIndex: React.FC = () => {
  const { pluginId } = Route.useParams();
  return <PluginFeed pluginId={pluginId} />;
};

export const Route = createFileRoute("/plugins/$pluginId/feed/")({
  component: FeedIndex,
});
