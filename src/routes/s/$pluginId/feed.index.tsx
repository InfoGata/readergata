import PluginFeed from "@/components/PluginFeed";
import { cleanFilterValues, filtersSearchSchema } from "@/lib/filters";
import { canonicalizePluginUrl, pluginIdParams } from "@/lib/plugin-route";
import { FilterValues } from "@/plugintypes";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";
import { z } from "zod";

const FeedIndex: React.FC = () => {
  const { pluginId } = Route.useParams();
  const { filters } = Route.useSearch();
  const navigate = useNavigate();

  const onApplyFilters = (values: FilterValues) => {
    navigate({
      to: "/s/$pluginId/feed",
      params: { pluginId },
      search: { filters: cleanFilterValues(values) },
    });
  };

  return (
    <PluginFeed
      pluginId={pluginId}
      filters={filters}
      onApplyFilters={onApplyFilters}
    />
  );
};

export const Route = createFileRoute("/s/$pluginId/feed/")({
  params: pluginIdParams(),
  beforeLoad: canonicalizePluginUrl,
  component: FeedIndex,
  validateSearch: z.object(filtersSearchSchema),
});
