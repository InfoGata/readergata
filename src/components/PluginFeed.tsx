import React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import usePlugins from "../hooks/usePlugins";
import ConfirmPluginDialog from "../components/ConfirmPluginDialog";
import FeedContainer from "../components/FeedContainer";
import Spinner from "../components/Spinner";
import useFindPlugin from "@/hooks/useFindPlugin";
import usePagination from "@/hooks/usePagination";
import { findPluginByParam } from "@/lib/plugin-route";

type PluginFeed = {
  pluginId: string;
  apiId?: string;
};

const PluginFeed: React.FC<PluginFeed> = (props) => {
  const { plugins, pluginsLoaded } = usePlugins();
  const { pluginId, apiId } = props;
  const plugin = findPluginByParam(plugins, pluginId);
  const { pageInfo, nextPage, prevPage, reset } = usePagination();

  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  React.useEffect(() => {
    reset();
  }, [pluginId, apiId, reset]);

  const getFeed = async () => {
    if (plugin && (await plugin.hasDefined.onGetFeed())) {
      const feed = await plugin.remote.onGetFeed({ apiId, pageInfo });
      return feed;
    }
  };

  const query = useQuery({
    queryKey: ["pluginFeed", pluginId, apiId, pageInfo?.offset],
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
