import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import {
  cleanFilterValues,
  filterKey,
  filtersSearchSchema,
} from "@/lib/filters";
import { offsetSearchSchema } from "@/lib/pagination";
import { FilterValues } from "@/plugintypes";
import { z } from "zod";

const PluginFeedSearch: React.FC = () => {
  const { pluginId } = Route.useParams();
  const { apiId, query, searchInfo, filters, offset } = Route.useSearch();
  const { plugins, pluginsLoaded } = usePlugins();
  const plugin = findPluginByParam(plugins, pluginId);
  const navigate = useNavigate();
  const filtersKey = filterKey(filters);

  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  const onApplyFilters = (values: FilterValues) => {
    navigate({
      to: "/s/$pluginId/feed/search",
      params: { pluginId },
      // A different filter is a different result set, so the page the reader
      // was on no longer refers to anything.
      search: (prev) => ({
        ...prev,
        filters: cleanFilterValues(values),
        offset: undefined,
      }),
    });
  };

  const onOffsetChange = React.useCallback(
    (next?: number) =>
      navigate({
        to: "/s/$pluginId/feed/search",
        params: { pluginId },
        search: (prev) => ({ ...prev, offset: next }),
      }),
    [navigate, pluginId]
  );

  const { pageInfo, nextPage, prevPage } = usePagination({
    offset,
    onOffsetChange,
  });

  const searchFeed = async () => {
    if (plugin && (await plugin.hasDefined.onSearch()) && query) {
      return await plugin.remote.onSearch({
        query: query || "",
        apiId: apiId ?? undefined,
        searchInfo: searchInfo ?? undefined,
        pageInfo,
        filters,
      });
    }
  };

  const searchQuery = useQuery({
    queryKey: [
      "searchFeed",
      pluginId,
      apiId,
      query,
      pageInfo?.offset,
      filtersKey,
    ],
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
          filters={filters}
          onApplyFilters={onApplyFilters}
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
  ...filtersSearchSchema,
  ...offsetSearchSchema,
});

export const Route = createFileRoute("/s/$pluginId/feed/search")({
  params: pluginIdParams(),
  beforeLoad: canonicalizePluginUrl,
  component: PluginFeedSearch,
  validateSearch: feedSearchSchema,
});
