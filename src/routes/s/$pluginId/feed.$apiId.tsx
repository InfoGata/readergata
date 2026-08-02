import PluginFeed from "@/components/PluginFeed";
import { cleanFilterValues, filtersSearchSchema } from "@/lib/filters";
import { canonicalizePluginUrl, pluginIdParams } from "@/lib/plugin-route";
import { FilterValues } from "@/plugintypes";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";
import { z } from "zod";

const FeedApiId: React.FC = () => {
  const { pluginId, apiId } = Route.useParams();
  const { filters } = Route.useSearch();
  const navigate = useNavigate();

  const onApplyFilters = (values: FilterValues) => {
    navigate({
      to: "/s/$pluginId/feed/$apiId",
      params: { pluginId, apiId },
      search: { filters: cleanFilterValues(values) },
    });
  };

  return (
    <PluginFeed
      pluginId={pluginId}
      apiId={decodeURIComponent(apiId)}
      filters={filters}
      onApplyFilters={onApplyFilters}
    />
  );
};

export const Route = createFileRoute("/s/$pluginId/feed/$apiId")({
  params: pluginIdParams<{ apiId: string }>(),
  beforeLoad: canonicalizePluginUrl,
  component: FeedApiId,
  validateSearch: z.object(filtersSearchSchema),
});
