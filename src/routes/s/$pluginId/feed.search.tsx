import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import useFindPlugin from "@/hooks/useFindPlugin";
import usePagination from "@/hooks/usePagination";
import usePlugins from "@/hooks/usePlugins";
import ConfirmPluginDialog from "@/components/ConfirmPluginDialog";
import FeedContainer from "@/components/FeedContainer";
import Spinner from "@/components/Spinner";
import {
  canonicalizePluginUrl,
  findPluginByParam,
  pluginIdParams,
} from "@/lib/plugin-route";
import { z } from "zod";

const PluginFeedSearch: React.FC = () => {
  const { pluginId } = Route.useParams();
  const { apiId, query, searchInfo } = Route.useSearch();
  const { plugins, pluginsLoaded } = usePlugins();
  const plugin = findPluginByParam(plugins, pluginId);
  const { pageInfo, nextPage, prevPage, reset } = usePagination();

  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  React.useEffect(() => {
    reset();
  }, [pluginId, apiId, query, reset]);

  const searchFeed = async () => {
    if (plugin && (await plugin.hasDefined.onSearch()) && query) {
      return await plugin.remote.onSearch({
        query: query || "",
        apiId: apiId ?? undefined,
        searchInfo: searchInfo ?? undefined,
        pageInfo,
      });
    }
  };

  const searchQuery = useQuery({
    queryKey: ["searchFeed", pluginId, apiId, query, pageInfo?.offset],
    queryFn: searchFeed,
    enabled: pluginsLoaded && !!plugin,
    placeholderData: keepPreviousData,
  });

  const returnedPageInfo = searchQuery.data?.pageInfo;

  return (
    <div>
      <Spinner open={searchQuery.isLoading || isLoading} />
      {searchQuery.data && (
        <FeedContainer
          feed={searchQuery.data}
          plugin={plugin}
          apiId={apiId || undefined}
          searchInfo={searchInfo || undefined}
          onNextPage={
            returnedPageInfo ? () => nextPage(returnedPageInfo) : undefined
          }
          onPrevPage={
            returnedPageInfo ? () => prevPage(returnedPageInfo) : undefined
          }
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

export const Route = createFileRoute("/s/$pluginId/feed/search")({
  params: pluginIdParams(),
  beforeLoad: canonicalizePluginUrl,
  component: PluginFeedSearch,
  validateSearch: feedSearchSchema,
});
