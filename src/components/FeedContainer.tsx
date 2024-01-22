import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PluginFrameContainer } from "../PluginsContext";
import { Feed } from "../plugintypes";
import PublicationInfo from "./PublicationInfo";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import AboutLink from "./AboutLink";

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
    <div>
      {feed.hasSearch && (
        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <Input
            placeholder={t("search")}
            value={query}
            onChange={onSearchChange}
          />
          <Button type="submit">{t("search")}</Button>
        </form>
      )}
      <div>
        {feed.type === "publication"
          ? feed.items.map((p, i) => (
              <PublicationInfo key={i} publication={p} />
            ))
          : feed.items.map((c, i) => (
              <AboutLink
                key={i}
                title={c.name}
                internalPath={`/plugins/${c.pluginId}/feed/${encodeURIComponent(
                  c.apiId || ""
                )}`}
              />
            ))}
      </div>
    </div>
  );
};

export default FeedContainer;
