import PluginFeed from "@/components/PluginFeed";
import { cleanFilterValues, filtersSearchSchema } from "@/lib/filters";
import { offsetSearchSchema } from "@/lib/pagination";
import { canonicalizePluginUrl, pluginIdParams } from "@/lib/plugin-route";
import { FilterValues } from "@/plugintypes";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";
import { z } from "zod";

const FeedIndex: React.FC = () => {
  const { pluginId } = Route.useParams();
  const { filters, offset } = Route.useSearch();
  const navigate = useNavigate();

  const onApplyFilters = (values: FilterValues) => {
    navigate({
      to: "/s/$pluginId/feed",
      params: { pluginId },
      // A different filter is a different result set, so the page the reader
      // was on no longer refers to anything: start over by leaving it off.
      search: { filters: cleanFilterValues(values) },
    });
  };

  const onOffsetChange = React.useCallback(
    (next?: number) =>
      navigate({
        to: "/s/$pluginId/feed",
        params: { pluginId },
        search: (prev) => ({ ...prev, offset: next }),
      }),
    [navigate, pluginId]
  );

  return (
    <PluginFeed
      pluginId={pluginId}
      filters={filters}
      onApplyFilters={onApplyFilters}
      offset={offset}
      onOffsetChange={onOffsetChange}
    />
  );
};

export const Route = createFileRoute("/s/$pluginId/feed/")({
  params: pluginIdParams(),
  beforeLoad: canonicalizePluginUrl,
  component: FeedIndex,
  validateSearch: z.object({ ...filtersSearchSchema, ...offsetSearchSchema }),
});
