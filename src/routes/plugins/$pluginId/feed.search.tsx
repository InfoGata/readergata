import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { useQuery } from "react-query";
import useFindPlugin from "@/hooks/useFindPlugin";
import usePlugins from "@/hooks/usePlugins";
import ConfirmPluginDialog from "@/components/ConfirmPluginDialog";
import FeedContainer from "@/components/FeedContainer";
import Spinner from "@/components/Spinner";
import { z } from "zod";

const PluginFeedSearch: React.FC = () => {
  const { pluginId } = Route.useParams();
  const { apiId, query, searchInfo } = Route.useSearch();
  const { plugins, pluginsLoaded } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);

  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  const searchFeed = async () => {
    if (plugin && (await plugin.hasDefined.onSearch()) && query) {
      return await plugin.remote.onSearch({
        query: query || "",
        apiId: apiId ?? undefined,
        searchInfo: searchInfo ?? undefined,
      });
    }
  };

  const searchQuery = useQuery(
    ["searchFeed", pluginId, apiId, query],
    searchFeed,
    {
      enabled: pluginsLoaded && !!plugin,
    }
  );

  return (
    <div>
      <Spinner open={searchQuery.isLoading || isLoading} />
      {searchQuery.data && (
        <FeedContainer
          feed={searchQuery.data}
          plugin={plugin}
          apiId={apiId || undefined}
          searchInfo={searchInfo || undefined}
        />
      )}
      <ConfirmPluginDialog
        open={Boolean(pendingPlugin)}
        plugins={pendingPlugin ? [pendingPlugin] : []}
        handleClose={removePendingPlugin}
      />
    </div>
  );
};

const feedSearchSchema = z.object({
  query: z.string().optional().catch(undefined),
  apiId: z.string().optional().catch(undefined),
  searchInfo: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/plugins/$pluginId/feed/search")({
  component: PluginFeedSearch,
  validateSearch: feedSearchSchema,
});
