import { PluginInterface } from "plugin-frame";
import React from "react";
import { useTranslation } from "react-i18next";
import PluginsContext, {
  PluginContextInterface,
  PluginFrameContainer,
  PluginMessage,
  PluginMethodInterface,
} from "../PluginsContext";
import { useAppSelector } from "../store/hooks";
import { db } from "../database";
import { useSnackbar } from "notistack";
import {
  getFileText,
  getFileTypeFromPluginUrl,
  getPlugin,
  getPluginSubdomain,
  hasExtension,
  mapAsync,
} from "../utils";
import { Manifest, NetworkRequest } from "../types";
import { Feed, NotificationMessage, PluginInfo } from "../plugintypes";
import semverValid from "semver/functions/parse";
import semverGt from "semver/functions/gt";

interface ApplicationPluginInterface extends PluginInterface {
  networkRequest(
    input: RequestInfo,
    init?: RequestInit
  ): Promise<NetworkRequest>;
  postUiMessage(message: any): Promise<void>;
  getCorsProxy(): Promise<string | undefined>;
  createNotification(notification: NotificationMessage): Promise<void>;
}

const PluginsProvider: React.FC<React.PropsWithChildren> = (props) => {
  const { t } = useTranslation("plugins");
  const [pluginsLoaded, setPluginsLoaded] = React.useState(false);
  const hasUpdated = React.useRef(false);

  const [pluginsFailed, setPluginsFailed] = React.useState(false);
  const [pluginFrames, setPluginFrames] = React.useState<
    PluginFrameContainer[]
  >([]);
  const [pluginMessage, setPluginMessage] = React.useState<PluginMessage>();

  const corsProxyUrl = useAppSelector((state) => state.settings.corsProxyUrl);
  const corsProxyUrlRef = React.useRef(corsProxyUrl);
  corsProxyUrlRef.current = corsProxyUrl;
  const disableAutoUpdatePlugins = useAppSelector(
    (state) => state.settings.disableAutoUpdatePlugins
  );

  const loadingPlugin = React.useRef(false);

  const { enqueueSnackbar } = useSnackbar();

  const loadPlugin = React.useCallback(
    async (plugin: PluginInfo, pluginFiles?: FileList) => {
      const api: ApplicationPluginInterface = {
        networkRequest: async (input: RequestInfo, init?: RequestInit) => {
          if (hasExtension()) {
            return await window.InfoGata.networkRequest(input, init);
          }

          const response = await fetch(input, init);

          const body = await response.blob();

          const responseHeaders = Object.fromEntries(
            response.headers.entries()
          );

          // Remove forbidden header
          if (responseHeaders["set-cookie"]) {
            delete responseHeaders["set-cookie"];
          }

          const result = {
            body: body,
            headers: responseHeaders,
            status: response.status,
            statusText: response.statusText,
            url: response.url,
          };
          return result;
        },
        isNetworkRequestCorsDisabled: async () => {
          const isDisabled = hasExtension();
          return isDisabled;
        },
        postUiMessage: async (message: any) => {
          setPluginMessage({ pluginId: plugin.id, message });
        },
        createNotification: async (notification: NotificationMessage) => {
          enqueueSnackbar(notification.message, { variant: notification.type });
        },
        getCorsProxy: async () => {
          if (import.meta.env.PROD || corsProxyUrlRef.current) {
            return corsProxyUrlRef.current;
          } else {
            return "http://localhost:36325/";
          }
        },
      };

      const completeMethods: {
        [key in keyof PluginMethodInterface]?: (
          arg: any
        ) =>
          | ReturnType<PluginMethodInterface[key]>
          | Awaited<ReturnType<PluginMethodInterface[key]>>;
      } = {
        onGetFeed: (feed: Feed) => {
          feed?.items.forEach((i) => {
            i.pluginId = plugin.id;
          });
          return feed;
        },
        onSearch: (feed: Feed) => {
          feed?.items.forEach((i) => {
            i.pluginId = plugin.id;
          });
          return feed;
        },
      };

      const srcUrl = `${getPluginSubdomain(plugin.id)}/pluginframe.html`;
      const host = new PluginFrameContainer(api, {
        completeMethods,
        frameSrc: new URL(srcUrl),
        sandboxAttributes: ["allow-scripts", "allow-same-origin"],
      });
      host.id = plugin.id;
      host.optionsSameOrigin = plugin.optionsSameOrigin;
      host.name = plugin.name;
      host.version = plugin.version;
      host.hasOptions = !!plugin.optionsHtml;
      host.fileList = pluginFiles;
      host.manifestUrl = plugin.manifestUrl;
      const timeoutMs = 10000;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(), timeoutMs);
      });
      await Promise.race([host.ready(), timeoutPromise]);
      await host.executeCode(plugin.script);
      return host;
    },
    [enqueueSnackbar]
  );

  const loadPlugins = React.useCallback(async () => {
    setPluginsFailed(false);
    try {
      const plugs = await db.plugins.toArray();

      const framePromises = plugs.map((p) => loadPlugin(p));
      const frames = await Promise.all(framePromises);
      setPluginFrames(frames);
    } catch {
      enqueueSnackbar(t("failedPlugins"), { variant: "error" });
      setPluginsFailed(true);
    } finally {
      setPluginsLoaded(true);
    }
  }, [loadPlugin, enqueueSnackbar, t]);

  React.useEffect(() => {
    if (loadingPlugin.current) return;
    loadingPlugin.current = true;
    loadPlugins();
  }, [loadPlugins]);

  const addPlugin = async (plugin: PluginInfo) => {
    if (pluginFrames.some((p) => p.id === plugin.id)) {
      return;
    }

    const pluginFrame = await loadPlugin(plugin);
    setPluginFrames([...pluginFrames, pluginFrame]);
    await db.plugins.add(plugin);
  };

  const updatePlugin = React.useCallback(
    async (plugin: PluginInfo, id: string, pluginFiles?: FileList) => {
      const oldPlugin = pluginFrames.find((p) => p.id === id);
      oldPlugin?.destroy();
      const pluginFrame = await loadPlugin(plugin, pluginFiles);
      setPluginFrames(pluginFrames.map((p) => (p.id === id ? pluginFrame : p)));
      await db.plugins.put(plugin);
    },
    [loadPlugin, pluginFrames]
  );

  React.useEffect(() => {
    const checkUpdate = async () => {
      if (pluginsLoaded && !disableAutoUpdatePlugins && !hasUpdated.current) {
        hasUpdated.current = true;
        await mapAsync(pluginFrames, async (p) => {
          if (p.manifestUrl) {
            const fileType = getFileTypeFromPluginUrl(p.manifestUrl);
            const manifestText = await getFileText(fileType, "manifest.json");
            if (manifestText) {
              const manifest = JSON.parse(manifestText) as Manifest;
              if (
                manifest.version &&
                p.version &&
                semverValid(manifest.version) &&
                semverValid(p.version) &&
                semverGt(manifest.version, p.version)
              ) {
                const newPlugin = await getPlugin(fileType);

                if (newPlugin && p.id) {
                  newPlugin.id = p.id;
                  newPlugin.manifestUrl = p.manifestUrl;
                  await updatePlugin(newPlugin, p.id);
                }
              }
            }
          }
        });
      }
    };
    checkUpdate();
  }, [pluginsLoaded, pluginFrames, disableAutoUpdatePlugins, updatePlugin]);

  const deletePlugin = async (pluginFrame: PluginFrameContainer) => {
    const newPlugins = pluginFrames.filter((p) => p.id !== pluginFrame.id);
    setPluginFrames(newPlugins);
    await db.plugins.delete(pluginFrame.id || "");
  };

  const defaultContext: PluginContextInterface = {
    addPlugin: addPlugin,
    deletePlugin: deletePlugin,
    updatePlugin: updatePlugin,
    plugins: pluginFrames,
    pluginsLoaded,
    pluginMessage,
    pluginsFailed,
    reloadPlugins: loadPlugins,
  };

  return (
    <PluginsContext.Provider value={defaultContext}>
      {props.children}
    </PluginsContext.Provider>
  );
};

export default PluginsProvider;
