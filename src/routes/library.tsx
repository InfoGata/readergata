import { Link, createFileRoute } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import React from "react";
import { PluginFrameContainer } from "../PluginsContext";
import usePlugins from "../hooks/usePlugins";
import { filterAsync } from "@infogata/utils";
import LibraryBooks from "../components/Library/LibraryBooks";

const Library: React.FC = () => {
  const { plugins } = usePlugins();
  const [feedPlugins, setFeedPlugins] = React.useState<PluginFrameContainer[]>(
    []
  );

  React.useEffect(() => {
    const setPlugins = async () => {
      const filteredPlugins = await filterAsync(
        plugins,
        async (p) =>
          (await p.hasDefined.onGetFeed()) && (await p.hasDefined.onGetFeed())
      );
      setFeedPlugins(filteredPlugins);
    };
    setPlugins();
  }, [plugins]);

  const pluginFeeds = feedPlugins.map((p) => (
    <Link
      key={p.id}
      className={buttonVariants({ variant: "outline" })}
      to="/plugins/$pluginId/feed"
      params={{ pluginId: p.id || "" }}
    >
      {p.name}
    </Link>
  ));

  return (
    <>
      {pluginFeeds}
      <LibraryBooks />
    </>
  );
};

export const Route = createFileRoute("/library")({
  component: Library,
});
