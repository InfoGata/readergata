import { Grid } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { useLocation, useParams } from "react-router-dom";
import useFindPlugin from "../hooks/useFindPlugin";
import usePlugins from "../hooks/usePlugins";
import ConfirmPluginDialog from "../components/ConfirmPluginDialog";
import FeedContainer from "../components/FeedContainer";
import Spinner from "../components/Spinner";

const PluginFeedSearch: React.FC = (props) => {
  const { plugins, pluginsLoaded } = usePlugins();
  const { pluginId } = useParams<"pluginId">();
  const plugin = plugins.find((p) => p.id === pluginId);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("query");
  const searchInfo = params.get("searchInfo");
  const apiId = params.get("apiId");

  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  const searchFeed = async () => {
    if (plugin && (await plugin.hasDefined.onSearch()) && searchQuery) {
      return await plugin.remote.onSearch({
        query: searchQuery,
        apiId: apiId ?? undefined,
        searchInfo: searchInfo ?? undefined,
      });
    }
  };

  const query = useQuery(
    ["searchFeed", pluginId, apiId, searchQuery],
    searchFeed,
    {
      enabled: pluginsLoaded && !!plugin,
    }
  );

  return (
    <Grid>
      <Spinner open={query.isLoading || isLoading} />
      {query.data && (
        <FeedContainer
          feed={query.data}
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
    </Grid>
  );
};

export default PluginFeedSearch;
