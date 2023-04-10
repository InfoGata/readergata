import {
  Backdrop,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";
import useFindPlugin from "../hooks/useFindPlugin";
import usePlugins from "../hooks/usePlugins";
import ConfirmPluginDialog from "./ConfirmPluginDialog";
import PublicationInfo from "./PublicationInfo";

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
      <List>
        {query.data?.type === "publication"
          ? query.data?.items.map((p, i) => (
              <PublicationInfo key={i} publication={p} />
            ))
          : query.data?.items.map((c, i) => (
              <ListItem key={i} disablePadding>
                <ListItemButton
                  component={Link}
                  to={`/plugins/${c.pluginId}/feed/${encodeURIComponent(
                    c.apiId || ""
                  )}`}
                >
                  <ListItemText primary={c.name} />
                </ListItemButton>
              </ListItem>
            ))}
      </List>
      <ConfirmPluginDialog
        open={Boolean(pendingPlugin)}
        plugins={pendingPlugin ? [pendingPlugin] : []}
        handleClose={removePendingPlugin}
      />
    </Grid>
  );
};

export default PluginFeed;
