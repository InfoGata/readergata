import React from "react";
import { useQuery } from "@tanstack/react-query";
import usePlugins from "../hooks/usePlugins";
import ConfirmPluginDialog from "../components/ConfirmPluginDialog";
import FeedContainer from "../components/FeedContainer";
import Spinner from "../components/Spinner";
import useFindPlugin from "@/hooks/useFindPlugin";

type PluginFeed = {
  pluginId: string;
  apiId?: string;
};

const PluginFeed: React.FC<PluginFeed> = (props) => {
  const { plugins, pluginsLoaded } = usePlugins();
  const { pluginId, apiId } = props;
  const plugin = plugins.find((p) => p.id === pluginId);

  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  const getFeed = async () => {
    if (plugin && (await plugin.hasDefined.onGetFeed())) {
      const feed = await plugin.remote.onGetFeed({ apiId });
      return feed;
    }
  };

  const query = useQuery({
    queryKey: ["pluginFeed", pluginId, apiId],
    queryFn: getFeed,
    enabled: pluginsLoaded && !!plugin,
  });

  return (
    <div>
      <Spinner open={query.isLoading || isLoading} />
      {query.data && (
        <FeedContainer
          feed={query.data}
          plugin={plugin}
          searchInfo={query.data.searchInfo}
          apiId={apiId}
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
