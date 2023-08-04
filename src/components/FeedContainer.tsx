import {
  Button,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { PluginFrameContainer } from "../PluginsContext";
import { Feed } from "../plugintypes";
import PublicationInfo from "./PublicationInfo";

interface FeedContainerProps {
  feed: Feed;
  plugin?: PluginFrameContainer;
  apiId?: string;
  searchInfo?: string;
}

const FeedContainer: React.FC<FeedContainerProps> = (props) => {
  const { feed, plugin, apiId, searchInfo } = props;
  const { t } = useTranslation();
  const [query, setQuery] = React.useState("");
  const navigate = useNavigate();

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.currentTarget.value);
  };

  const onSubmit: React.FormEventHandler = async (event) => {
    event.preventDefault();

    if (plugin && (await plugin.hasDefined.onSearch())) {
      const params = new URLSearchParams();
      params.append("query", query);
      if (searchInfo) {
        params.append("searchInfo", searchInfo);
      }
      if (apiId) {
        params.append("apiId", apiId);
      }
      navigate({
        pathname: `/plugins/${plugin.id}/feed/search`,
        search: `?${params.toString()}`,
      });
    }
  };

  return (
    <Grid>
      {feed.hasSearch && (
        <form onSubmit={onSubmit}>
          <TextField
            placeholder={t("search")}
            value={query}
            onChange={onSearchChange}
          />
          <Button type="submit">{t("search")}</Button>
        </form>
      )}
      <List>
        {feed.type === "publication"
          ? feed.items.map((p, i) => (
              <PublicationInfo key={i} publication={p} />
            ))
          : feed.items.map((c, i) => (
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
    </Grid>
  );
};

export default FeedContainer;
