import React from "react";
import { useTranslation } from "react-i18next";
import { PluginFrameContainer } from "../contexts/PluginsContext";
import { Feed, FilterValues } from "../plugintypes";
import PublicationLink from "./PublicationLink";
import Filtering from "./Filtering";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import AboutLink from "./AboutLink";
import { useNavigate } from "@tanstack/react-router";
import { hasNextPage, hasPrevPage } from "../lib/pagination";

interface FeedContainerProps {
  feed: Feed;
  plugin?: PluginFrameContainer;
  apiId?: string;
  searchInfo?: string;
  filters?: FilterValues;
  onApplyFilters?: (values: FilterValues) => void;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

const FeedContainer: React.FC<FeedContainerProps> = (props) => {
  const {
    feed,
    plugin,
    apiId,
    searchInfo,
    filters,
    onApplyFilters,
    onNextPage,
    onPrevPage,
  } = props;
  const { t } = useTranslation();
  const [query, setQuery] = React.useState("");
  const navigate = useNavigate();
  const pageInfo = feed.pageInfo;

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.currentTarget.value);
  };

  const onSubmit: React.FormEventHandler = async (event) => {
    event.preventDefault();

    if (plugin && (await plugin.hasDefined.onSearch())) {
      navigate({
        to: "/s/$pluginId/feed/search",
        params: { pluginId: plugin.id || "" },
        // Filters carry over: searching from a filtered feed narrows what the
        // user is already looking at rather than starting from scratch.
        search: {
          apiId: apiId,
          searchInfo: searchInfo,
          query: query,
          filters: filters,
        },
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
      {feed.filterInfo && onApplyFilters && (
        <Filtering
          filterInfo={feed.filterInfo}
          values={filters}
          onApply={onApplyFilters}
        />
      )}
      <div>
        {feed.type === "publication"
          ? feed.items.map((p, i) => <PublicationLink key={i} publication={p} />)
          : feed.items.map((c, i) => (
              <AboutLink
                key={i}
                title={c.name}
                link={{
                  to: "/s/$pluginId/feed/$apiId",
                  params: {
                    pluginId: c.pluginId || "",
                    apiId: encodeURIComponent(c.apiId || ""),
                  },
                }}
              />
            ))}
      </div>
      {pageInfo && (
        <div className="flex items-center justify-between gap-2 py-4">
          <Button
            variant="outline"
            disabled={!hasPrevPage(pageInfo)}
            onClick={onPrevPage}
          >
            {t("previous")}
          </Button>
          <span className="text-sm text-muted-foreground">
            {pageInfo.totalResults === undefined
              ? t("pageRange", {
                  from: (pageInfo.offset + 1).toLocaleString(),
                  to: (pageInfo.offset + feed.items.length).toLocaleString(),
                })
              : t("pageRangeOfTotal", {
                  from: (pageInfo.offset + 1).toLocaleString(),
                  to: (pageInfo.offset + feed.items.length).toLocaleString(),
                  total: pageInfo.totalResults.toLocaleString(),
                })}
          </span>
          <Button
            variant="outline"
            disabled={!hasNextPage(pageInfo)}
            onClick={onNextPage}
          >
            {t("next")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FeedContainer;
