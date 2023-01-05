import { Button } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { PluginFrameContainer, usePlugins } from "../PluginsContext";
import { filterAsync } from "../utils";

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

  return <>{pluginFeeds}</>;
};

export default Library;
