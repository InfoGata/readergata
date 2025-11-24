import { PluginInterface } from "plugin-frame";
import React from "react";
import { useTranslation } from "react-i18next";
import semverGt from "semver/functions/gt";
import semverValid from "semver/functions/parse";
import { toast } from "sonner";
import PluginsContext, {
  PluginContextInterface,
  PluginFrameContainer,
  PluginMessage,
  PluginMethodInterface,
} from "../contexts/PluginsContext";
import { db } from "../database";
import { defaultPlugins } from "../default-plugins";
import {
  Feed,
  Manifest,
  NotificationMessage,
  PluginInfo,
  Theme,
} from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setPluginsPreInstalled } from "../store/reducers/settingsReducer";
import { NetworkRequest } from "../types";
import {
  isCorsDisabled,
  getFileText,
  getFileTypeFromPluginUrl,
  getPlugin,
  getPluginUrl,
  hasExtension,
  isAuthorizedDomain,
} from "../utils";
import { useTheme } from "@/hooks/useTheme";
import { mapAsync } from "@infogata/utils";

interface ApplicationPluginInterface extends PluginInterface {
  networkRequest(input: string, init?: RequestInit): Promise<NetworkRequest>;
  postUiMessage(message: any): Promise<void>;
  getCorsProxy(): Promise<string | undefined>;
  createNotification(notification: NotificationMessage): Promise<void>;
  isLoggedIn(): Promise<boolean>;
  getTheme(): Promise<Theme>;
}

const PluginsProvider: React.FC<React.PropsWithChildren> = (props) => {
  const { t } = useTranslation("plugins");
  const [pluginsLoaded, setPluginsLoaded] = React.useState(false);
  const hasUpdated = React.useRef(false);
  const [pluginsFailed, setPluginsFailed] = React.useState(false);
  const dispatch = useAppDispatch();
  const [pluginFrames, setPluginFrames] = React.useState<
    PluginFrameContainer[]
  >([]);
  const [pluginMessage, setPluginMessage] = React.useState<PluginMessage>();

  const corsProxyUrl = useAppSelector((state) => state.settings.corsProxyUrl);
  const corsProxyUrlRef = React.useRef(corsProxyUrl);
  corsProxyUrlRef.current = corsProxyUrl;
  const theme = useTheme();
  const themeRef = React.useRef(theme.theme);
  themeRef.current = theme.theme;

  const disableAutoUpdatePlugins = useAppSelector(
    (state) => state.settings.disableAutoUpdatePlugins
  );

  const loadingPlugin = React.useRef(false);

  const pluginsPreinstalled = useAppSelector(
    (state) => state.settings.pluginsPreinstalled
  );
  const [preinstallComplete, setPreinstallComplete] =
    React.useState(pluginsPreinstalled);

  const loadPlugin = React.useCallback(
    async (plugin: PluginInfo, pluginFiles?: FileList) => {
      const api: ApplicationPluginInterface = {
        networkRequest: async (input: string, init?: RequestInit) => {
          const pluginAuth = plugin?.id
            ? await db.pluginAuths.get(plugin.id)
            : undefined;
          const newInit = init ?? {};

          if (
            !plugin?.manifest?.authentication ||
            !isAuthorizedDomain(
              input,
              plugin.manifest.authentication.loginUrl,
              plugin.manifest.authentication.domainHeadersToFind
            )
          ) {
            newInit.credentials = "omit";
          }

          if (pluginAuth) {
            if (Object.keys(pluginAuth.headers).length > 0) {
              const headers = new Headers(newInit.headers);
              for (const prop in pluginAuth.headers) {
                headers.set(prop, pluginAuth.headers[prop]);
              }
              newInit.headers = Object.fromEntries(headers.entries());
            } else if (Object.keys(pluginAuth.domainHeaders ?? {}).length > 0) {
              const url = new URL(input);
              const domainHeaderKey = Object.keys(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                pluginAuth.domainHeaders!
              ).find((dh) => url.host.endsWith(dh));
              if (domainHeaderKey) {
                const headers = new Headers(newInit.headers);
                for (const prop in pluginAuth.domainHeaders?.[
                  domainHeaderKey
                ]) {
                  headers.set(
                    prop,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    pluginAuth.domainHeaders![domainHeaderKey][prop]
                  );
                }
                newInit.headers = Object.fromEntries(headers.entries());
              }
            }
          }

          if (hasExtension()) {
            return await window.InfoGata.networkRequest(input, newInit, {
              auth: plugin.manifest?.authentication,
            });
          }

          const response = await fetch(input, newInit);

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
          return isCorsDisabled();
        },
        postUiMessage: async (message: any) => {
          setPluginMessage({ pluginId: plugin.id, message });
        },
        createNotification: async (notification: NotificationMessage) => {
          let toaster = toast.message;
          switch (notification.type) {
            case "error":
              toaster = toast.error;
              break;
            case "success":
              toaster = toast.success;
              break;
            case "info":
              toaster = toast.info;
              break;
            case "warning":
              toaster = toast.warning;
              break;
          }
          toaster(notification.message);
        },
        getCorsProxy: async () => {
          if (import.meta.env.PROD || corsProxyUrlRef.current) {
            return corsProxyUrlRef.current;
          } else {
            return "http://localhost:36325/";
          }
        },
        isLoggedIn: async () => {
          if (plugin.manifest?.authentication && plugin.id) {
            return !!db.pluginAuths.get(plugin.id);
          }
          return false;
        },
        getTheme: async () => {
          return themeRef.current;
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

      const srcUrl = getPluginUrl(plugin.id || "", "/pluginframe.html");
      const host = new PluginFrameContainer(api, {
        completeMethods,
        frameSrc: srcUrl,
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
    []
  );

  const loadPlugins = React.useCallback(async () => {
    setPluginsFailed(false);
    try {
      const plugs = await db.plugins.toArray();

      const framePromises = plugs.map((p) => loadPlugin(p));
      const frames = await Promise.all(framePromises);
      setPluginFrames(frames);
    } catch {
      toast.error(t("failedPlugins"));
      setPluginsFailed(true);
    } finally {
      setPluginsLoaded(true);
    }
  }, [loadPlugin, t]);

  React.useEffect(() => {
    if (loadingPlugin.current) return;
    loadingPlugin.current = true;
    loadPlugins();
  }, [loadPlugins]);

  const addPlugin = async (plugin: PluginInfo) => {
    if (pluginFrames.some((p) => p.id === plugin.id)) {
      toast(`A plugin with Id ${plugin.id} is already installed`);
      return;
    }

    await loadAndAddPlugin(plugin);
  };

  const loadAndAddPlugin = React.useCallback(
    async (plugin: PluginInfo) => {
      const pluginFrame = await loadPlugin(plugin);
      setPluginFrames((prev) => [...prev, pluginFrame]);
      await db.plugins.put(plugin);
    },
    [loadPlugin]
  );

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
    const preinstall = async () => {
      if (pluginsLoaded && !pluginsPreinstalled) {
        try {
          // Make sure preinstall plugins aren't already installed
          const presinstallPlugins = defaultPlugins.filter(
            (dp) => !!dp.preinstall
          );
          const plugs = await db.plugins.toArray();
          const newPlugins = presinstallPlugins.filter(
            (preinstall) => !plugs.some((pf) => pf.id === preinstall.id)
          );
          await mapAsync(newPlugins, async (newPlugin) => {
            const fileType = getFileTypeFromPluginUrl(newPlugin.url);
            const plugin = await getPlugin(fileType, true);
            if (!plugin) return;

            await loadAndAddPlugin(plugin);
          });
          dispatch(setPluginsPreInstalled());
        } finally {
          setPreinstallComplete(true);
        }
      }
    };

    preinstall();
  }, [dispatch, pluginsLoaded, pluginsPreinstalled, loadAndAddPlugin]);

  React.useEffect(() => {
    const checkUpdate = async () => {
      if (pluginsLoaded && !disableAutoUpdatePlugins && !hasUpdated.current) {
        hasUpdated.current = true;
        await mapAsync(pluginFrames, async (p) => {
          if (p.manifestUrl) {
            const fileType = getFileTypeFromPluginUrl(p.manifestUrl);
            const manifestText = await getFileText(
              fileType,
              "manifest.json",
              true
            );
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
    preinstallComplete: preinstallComplete ?? false,
    reloadPlugins: loadPlugins,
  };

  return (
    <PluginsContext.Provider value={defaultContext}>
      {props.children}
    </PluginsContext.Provider>
  );
};

export default PluginsProvider;
