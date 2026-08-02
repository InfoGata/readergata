import React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import usePlugins from "../hooks/usePlugins";
import ConfirmPluginDialog from "../components/ConfirmPluginDialog";
import FeedContainer from "../components/FeedContainer";
import Spinner from "../components/Spinner";
import useFindPlugin from "@/hooks/useFindPlugin";
import usePagination from "@/hooks/usePagination";
import { findPluginByParam } from "@/lib/plugin-route";
import { filterKey } from "@/lib/filters";
import { FilterValues } from "@/plugintypes";

type PluginFeed = {
  pluginId: string;
  apiId?: string;
  filters?: FilterValues;
  onApplyFilters?: (values: FilterValues) => void;
};

const PluginFeed: React.FC<PluginFeed> = (props) => {
  const { plugins, pluginsLoaded } = usePlugins();
  const { pluginId, apiId, filters, onApplyFilters } = props;
  const plugin = findPluginByParam(plugins, pluginId);
  const { pageInfo, nextPage, prevPage, reset } = usePagination();
  const filtersKey = filterKey(filters);

  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  // Changing a filter changes what the result set is, so the page the user was
  // on no longer refers to anything.
  React.useEffect(() => {
    reset();
  }, [pluginId, apiId, filtersKey, reset]);

  const getFeed = async () => {
    if (plugin && (await plugin.hasDefined.onGetFeed())) {
      const feed = await plugin.remote.onGetFeed({ apiId, pageInfo, filters });
      return feed;
    }
  };

  const query = useQuery({
    queryKey: ["pluginFeed", pluginId, apiId, pageInfo?.offset, filtersKey],
    queryFn: getFeed,
    enabled: pluginsLoaded && !!plugin,
    placeholderData: keepPreviousData,
  });

  const returnedPageInfo = query.data?.pageInfo;

  return (
    <div>
      <Spinner open={query.isLoading || isLoading} />
      {query.data && (
        <FeedContainer
          feed={query.data}
          plugin={plugin}
          searchInfo={query.data.searchInfo}
          apiId={apiId}
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

export default PluginFeed;
