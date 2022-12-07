import {
  Backdrop,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";
import { usePlugins } from "../PluginsContext";
import PublicationInfo from "./PublicationInfo";

const PluginFeed: React.FC = () => {
  const { plugins } = usePlugins();
  const { pluginId } = useParams<"pluginId">();
  const { apiId } = useParams<"apiId">();
  const plugin = plugins.find((p) => p.id === pluginId);

  const getFeed = async () => {
    if (plugin && (await plugin.hasDefined.onGetFeed())) {
      const feed = await plugin.remote.onGetFeed({ apiId });
      return feed;
    }
  };

  const query = useQuery(["pluginFeed", pluginId, apiId], getFeed);

  return (
    <Grid>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <List>
        {query.data?.type === "publication"
          ? query.data?.items.map((p, i) => (
              <PublicationInfo key={i} publication={p} />
            ))
          : query.data?.items.map((c, i) => (
              <ListItem
                key={i}
                button={true}
                component={Link}
                to={`/plugins/${c.pluginId}/feed/${encodeURIComponent(
                  c.apiId || ""
                )}`}
              >
                <ListItemText primary={c.name} />
              </ListItem>
            ))}
      </List>
    </Grid>
  );
};

export default PluginFeed;
