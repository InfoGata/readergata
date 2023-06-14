import { Backdrop, CircularProgress, Grid } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import useFindPlugin from "../hooks/useFindPlugin";
import usePlugins from "../hooks/usePlugins";
import ConfirmPluginDialog from "./ConfirmPluginDialog";
import FeedContainer from "./FeedContainer";

const PluginFeed: React.FC = () => {
  const { plugins, pluginsLoaded } = usePlugins();
  const { pluginId } = useParams<"pluginId">();
  const { apiId } = useParams<"apiId">();
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

  const query = useQuery(["pluginFeed", pluginId, apiId], getFeed, {
    enabled: pluginsLoaded && !!plugin,
  });

  return (
    <Grid>
      <Backdrop open={query.isLoading || isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
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
    </Grid>
  );
};

export default PluginFeed;
