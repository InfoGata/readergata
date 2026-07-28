import React from "react";
import { PluginFrameContainer } from "../contexts/PluginsContext";
import { findDefaultPlugin } from "../default-plugins";
import { PluginInfo } from "../plugintypes";
import { getFileTypeFromPluginUrl, getPlugin } from "../utils";

interface FindPluginArgs {
  pluginsLoaded: boolean;
  pluginId: string | undefined;
  plugin: PluginFrameContainer | undefined;
}

const useFindPlugin = (args: FindPluginArgs) => {
  const { pluginsLoaded, pluginId, plugin } = args;
  const [isLoading, setIsloading] = React.useState(false);
  const [pendingPlugin, setPendingPlugin] = React.useState<PluginInfo | null>(
    null
  );

  React.useEffect(() => {
    const findPlugin = async () => {
      if (pluginsLoaded && !plugin && pluginId) {
        // The url may name the plugin by alias rather than id, since aliases
        // are what get shared.
        const newPlugin = findDefaultPlugin(pluginId);
        if (newPlugin) {
          setIsloading(true);
          const fileType = getFileTypeFromPluginUrl(newPlugin.url);

          const plugin = await getPlugin(fileType);
          if (plugin) {
            plugin.manifestUrl = newPlugin.url;
            setPendingPlugin(plugin);
          }
          setIsloading(false);
        }
      }
    };

    findPlugin();
  }, [pluginsLoaded, pluginId, plugin]);

  const removePendingPlugin = () => {
    setPendingPlugin(null);
  };

  return { isLoading, pendingPlugin, removePendingPlugin };
};

export default useFindPlugin;
