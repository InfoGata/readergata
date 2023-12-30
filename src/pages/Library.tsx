import { Button } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { PluginFrameContainer } from "../PluginsContext";
import usePlugins from "../hooks/usePlugins";
import { filterAsync } from "../utils";
import LibraryBooks from "../components/LibraryBooks";

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
    <Button component={Link} to={`/plugins/${p.id}/feed`} key={p.id}>
      {p.name}
    </Button>
  ));

  return (
    <>
      {pluginFeeds}
      <LibraryBooks />
    </>
  );
};

export default Library;
