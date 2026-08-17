import { PluginInterface, PluginFrame } from "plugin-frame";
import React from "react";
import { useTranslation } from "react-i18next";
import semverGt from "semver/functions/gt";
import semverValid from "semver/functions/parse";
import { toast } from "sonner";
import { db } from "../database";
import { defaultPlugins } from "../default-plugins";
import { useExtension } from "../hooks/useExtension";
import {
  Feed,
  GetFeedRequest,
  GetPublicationDetailsRequest,
  GetPublicationSourceRequest,
  GetPublicationSourceResponse,
  Manifest,
  NotificationMessage,
  PluginInfo,
  Publication,
  SearchRequest,
} from "../plugintypes";
import { Theme, useTheme } from "@infogata/shadcn-vite-theme-provider";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setPluginsPreInstalled } from "../store/reducers/settingsReducer";
import { NetworkRequest, SiteRedirectRule } from "../types";
import {
  isCorsDisabled,
  getFileText,
  getFileTypeFromPluginUrl,
  getPlugin,
  getPluginUrl,
  hasExtension,
  isAuthorizedDomain,
  hasAuthentication,
} from "../utils";
import {
  downloadSignal,
  readWithProgress,
} from "../lib/publication-download";
import { mapAsync } from "@infogata/utils";
import ConfirmUpdatePluginDialog from "../components/ConfirmUpdatePluginDialog";
import {
  AliasError,
  aliasFromName,
  assignAlias,
  setPluginAliases,
  validateAlias,
} from "@/lib/plugin-alias";

interface ApplicationPluginInterface extends PluginInterface {
  networkRequest(input: string, init?: RequestInit): Promise<NetworkRequest>;
  postUiMessage(message: any): Promise<void>;
  getCorsProxy(): Promise<string | undefined>;
  createNotification(notification: NotificationMessage): Promise<void>;
  isLoggedIn(): Promise<boolean>;
  getTheme(): Promise<Theme>;
}

export interface PluginMethodInterface {
  onGetPublicationSource(
    request: GetPublicationSourceRequest
  ): Promise<GetPublicationSourceResponse>;
  onGetPublicationDetails(
    request: GetPublicationDetailsRequest
  ): Promise<Publication>;
  onGetFeed(request: GetFeedRequest): Promise<Feed>;
  onSearch(request: SearchRequest): Promise<Feed>;
  onUiMessage(message: any): Promise<void>;
  onPostLogin(): Promise<void>;
  onPostLogout(): Promise<void>;
  onChangeTheme(theme: Theme): Promise<void>;
}

export interface PluginMessage {
  pluginId?: string;
  message: any;
}

export class PluginFrameContainer extends PluginFrame<PluginMethodInterface> {
  name?: string;
  id?: string;
  alias?: string;
  hasOptions?: boolean;
  fileList?: FileList;
  optionsSameOrigin?: boolean;
  version?: string;
  manifestUrl?: string;
}

export interface PluginContextInterface {
  addPlugin: (plugin: PluginInfo, pluginFiles?: FileList) => Promise<void>;
  updatePlugin: (
    plugin: PluginInfo,
    id: string,
    pluginFiles?: FileList
  ) => Promise<void>;
  deletePlugin: (plugin: PluginFrameContainer) => Promise<void>;
  setPluginAlias: (
    pluginId: string,
    alias: string
  ) => Promise<AliasError | null>;
  plugins: PluginFrameContainer[];
  pluginMessage?: PluginMessage;
  pluginsLoaded: boolean;
  pluginsFailed: boolean;
  preinstallComplete: boolean;
  reloadPlugins: () => Promise<void>;
}

const PluginsContext = React.createContext<PluginContextInterface>(undefined!);

export const PluginsProvider: React.FC<React.PropsWithChildren> = (props) => {
  const { t } = useTranslation("plugins");
  const [pluginsLoaded, setPluginsLoaded] = React.useState(false);
  const hasUpdated = React.useRef(false);
  const isMountedRef = React.useRef(true);

  const [pluginsFailed, setPluginsFailed] = React.useState(false);
  const dispatch = useAppDispatch();
  const { extensionDetected } = useExtension();
  const [pluginFrames, setPluginFrames] = React.useState<
    PluginFrameContainer[]
  >([]);
  const pluginFramesRef = React.useRef<PluginFrameContainer[]>([]);

  /**
   * The single place plugin frames become visible. Router params.parse and
   * stringify read the alias registry outside of React, so refresh it here:
   * this runs before pluginsLoaded flips true, which is what gates the router
   * from rendering at all (see src/router.tsx).
   */
  const publishFrames = React.useCallback((frames: PluginFrameContainer[]) => {
    pluginFramesRef.current = frames;
    setPluginAliases(frames);
    setPluginFrames(frames);
  }, []);

  const [pluginMessage, setPluginMessage] = React.useState<PluginMessage>();
  const [pendingUpdatePlugin, setPendingUpdatePlugin] =
    React.useState<PluginInfo | null>(null);

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
                pluginAuth.domainHeaders!
              ).find((dh) => url.host.endsWith(dh));
              if (domainHeaderKey) {
                const headers = new Headers(newInit.headers);
                for (const prop in pluginAuth.domainHeaders?.[
                  domainHeaderKey
                ]) {
                  headers.set(
                    prop,
                      pluginAuth.domainHeaders![domainHeaderKey][prop]
                  );
                }
                newInit.headers = Object.fromEntries(headers.entries());
              }
            }
          }

          // Set only while this plugin is fetching a publication for the
          // viewer, so a feed loading elsewhere is neither counted against the
          // progress bar nor abortable by the reader's cancel button.
          const signal = downloadSignal(plugin.id);

          const directRequest = async () => {
            const response = await fetch(input, { ...newInit, signal });

            const body = signal
              ? await readWithProgress(response)
              : await response.blob();

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
          };

          const viaExtension = async () =>
            await window.InfoGata.networkRequest(input, newInit, {
              auth: plugin.manifest?.authentication,
            });

          // The extension is here to get past CORS, and for a feed that is all
          // that matters. A publication is different: the extension answers in
          // one message, so it can report no progress and honour no cancel,
          // and chrome's messaging refuses it past 64 MiB besides. So a
          // transfer the reader is watching is fetched directly when it can
          // be, and the extension becomes the fallback rather than the first
          // choice.
          const attempts = !hasExtension()
            ? [directRequest]
            : signal
              ? [directRequest, viaExtension]
              : [viaExtension, directRequest];

          let firstError: unknown;
          for (const attempt of attempts) {
            try {
              return await attempt();
            } catch (e) {
              // Cancelling is not a failure to route around -- falling through
              // here would fetch the whole publication again by another road.
              if (signal?.aborted) throw e;
              console.error(e);
              firstError ??= e;
            }
          }
          // The route that was preferred is the one whose failure explains the
          // request: a CORS refusal from a fallback says nothing about why the
          // extension was reached for first.
          throw firstError;
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
          return corsProxyUrlRef.current;
        },
        isLoggedIn: async () => {
          if (await hasAuthentication() && plugin.manifest?.authentication && plugin.id) {
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
        // Stamped for the same reason feed items are: the publication page
        // builds source links out of it, and the viewer needs to know which
        // plugin to ask to resolve the source it was handed.
        onGetPublicationDetails: (publication: Publication) => {
          if (publication) {
            publication.pluginId = plugin.id;
          }
          return publication;
        },
      };

      const srcUrl = getPluginUrl(plugin.id || "", "/pluginframe.html");
      const host = new PluginFrameContainer(api, {
        completeMethods,
        frameSrc: srcUrl,
        sandboxAttributes: ["allow-scripts", "allow-same-origin"],
      });
      host.id = plugin.id;
      host.alias = plugin.alias;
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
    if (!isMountedRef.current) return;
    setPluginsFailed(false);
    try {
      const plugs = await db.plugins.toArray();
      // Publish aliases from the rows straight away: if loading a frame throws,
      // the catch below still lets pluginsLoaded flip and the router render,
      // and an empty registry would mis-parse every alias url on the page.
      setPluginAliases(plugs);

      const framePromises = plugs.map((p) => loadPlugin(p));
      const frames = await Promise.all(framePromises);
      if (isMountedRef.current) {
        publishFrames(frames);
      }
    } catch {
      if (isMountedRef.current) {
        toast.error(t("failedPlugins"));
        setPluginsFailed(true);
      }
    } finally {
      if (isMountedRef.current) {
        setPluginsLoaded(true);
      }
    }
  }, [loadPlugin, publishFrames, t]);

  React.useEffect(() => {
    if (loadingPlugin.current) return;
    loadingPlugin.current = true;
    loadPlugins();
  }, [loadPlugins]);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    }
  }, [])

  const addPlugin = async (plugin: PluginInfo) => {
    if (pluginFrames.some((p) => p.id === plugin.id)) {
      setPendingUpdatePlugin(plugin);
      return;
    }

    await loadAndAddPlugin(plugin);
  };

  const loadAndAddPlugin = React.useCallback(
    async (plugin: PluginInfo) => {
      if (!isMountedRef.current) return;
      // The manifest's alias is a request: fall back to the name, and take a
      // `-N` variant when another plugin already holds it. Assigned before the
      // frame loads so the frame carries the effective alias.
      plugin.alias = assignAlias(
        plugin.alias || plugin.manifest?.alias || aliasFromName(plugin.name),
        await db.plugins.toArray(),
        plugin.id
      );
      const pluginFrame = await loadPlugin(plugin);
      await db.plugins.put(plugin);
      publishFrames([...pluginFramesRef.current, pluginFrame]);
    },
    [loadPlugin, publishFrames]
  );

  const updatePlugin = React.useCallback(
    async (plugin: PluginInfo, id: string, pluginFiles?: FileList) => {
      // Urls have to survive plugin updates, so keep whatever alias the plugin
      // already has — including one the user picked — rather than letting a
      // changed manifest alias move them. Every update path (dev auto-reload,
      // auto-update, update from file) goes through here.
      const existing = await db.plugins.get(id);
      plugin.alias =
        existing?.alias ??
        assignAlias(
          plugin.alias || plugin.manifest?.alias || aliasFromName(plugin.name),
          await db.plugins.toArray(),
          id
        );
      const oldPlugin = pluginFramesRef.current.find((p) => p.id === id);
      oldPlugin?.destroy();
      const pluginFrame = await loadPlugin(plugin, pluginFiles);
      await db.plugins.put(plugin);
      publishFrames(
        pluginFramesRef.current.map((p) => (p.id === id ? pluginFrame : p))
      );
    },
    [loadPlugin, publishFrames]
  );

  /** Rename a plugin's url alias. Returns why it was rejected, or null. */
  const setPluginAlias = React.useCallback(
    async (pluginId: string, alias: string): Promise<AliasError | null> => {
      const plugin = await db.plugins.get(pluginId);
      if (!plugin) return "invalid";

      const error = validateAlias(alias, await db.plugins.toArray(), pluginId);
      if (error) return error;

      await db.plugins.update(pluginId, { alias });
      // Mutate the frame in place and publish a new array, so the registry and
      // every Link pick the new alias up before the caller navigates.
      publishFrames(
        pluginFramesRef.current.map((p) => {
          if (p.id === pluginId) p.alias = alias;
          return p;
        })
      );
      return null;
    },
    [publishFrames]
  );

  const handleConfirmUpdate = React.useCallback(async () => {
    if (pendingUpdatePlugin?.id) {
      await updatePlugin(pendingUpdatePlugin, pendingUpdatePlugin.id);
    }
    setPendingUpdatePlugin(null);
  }, [pendingUpdatePlugin, updatePlugin]);

  const handleCancelUpdate = React.useCallback(() => {
    setPendingUpdatePlugin(null);
  }, []);

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
            if (!isMountedRef.current) return;
            const fileType = getFileTypeFromPluginUrl(newPlugin.url);
            const plugin = await getPlugin(fileType, true);
            if (!plugin) return;

            await loadAndAddPlugin(plugin);
          });
          if (isMountedRef.current) {
            dispatch(setPluginsPreInstalled());
          }
        } finally {
          if (isMountedRef.current) {
            setPreinstallComplete(true);
          }
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
          if (!isMountedRef.current) return;
          if (p.manifestUrl) {
            const fileType = getFileTypeFromPluginUrl(p.manifestUrl);
            const manifestText = await getFileText(
              fileType,
              "manifest.json",
              true
            );
            if (!isMountedRef.current) return;
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

                if (!isMountedRef.current) return;
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

  // Auto-poll localhost plugins for changes during development
  const updatePluginRef = React.useRef(updatePlugin);
  updatePluginRef.current = updatePlugin;
  React.useEffect(() => {
    if (!pluginsLoaded) return;

    const DEV_POLL_INTERVAL = 3000;
    const scriptCache = new Map<string, string>();

    const checkForUpdates = async () => {
      const dbPlugins = await db.plugins.toArray();
      const localhostPlugins = dbPlugins.filter(
        (p) => p.manifestUrl && new URL(p.manifestUrl).hostname === "localhost"
      );

      for (const dbPlugin of localhostPlugins) {
        try {
          const fileType = getFileTypeFromPluginUrl(dbPlugin.manifestUrl!);
          const newPlugin = await getPlugin(fileType, true);
          if (!newPlugin || !dbPlugin.id) continue;

          const cached = scriptCache.get(dbPlugin.id);
          if (cached === undefined) {
            // First check — seed cache, don't update
            scriptCache.set(dbPlugin.id, newPlugin.script);
            continue;
          }

          if (newPlugin.script !== cached) {
            scriptCache.set(dbPlugin.id, newPlugin.script);
            newPlugin.id = dbPlugin.id;
            newPlugin.manifestUrl = dbPlugin.manifestUrl;
            console.log(`[dev] Auto-updating plugin: ${newPlugin.name}`);
            await updatePluginRef.current(newPlugin, dbPlugin.id);
          }
        } catch {
          // Server might be down, ignore
        }
      }
    };

    const interval = setInterval(checkForUpdates, DEV_POLL_INTERVAL);
    // Run immediately to seed cache
    checkForUpdates();

    return () => clearInterval(interval);
  }, [pluginsLoaded]);

  // Register site redirect rules with the extension
  React.useEffect(() => {
    if (!pluginsLoaded || pluginFrames.length === 0) return;
    if (!hasExtension() || !window.InfoGata?.registerRedirects) return;

    const registerRedirects = async () => {
      const dbPlugins = await db.plugins.toArray();
      const rules: SiteRedirectRule[] = [];

      for (const plugin of dbPlugins) {
        const siteMatch = plugin.manifest?.siteMatch;
        if (siteMatch && siteMatch.length > 0 && plugin.id) {
          rules.push({
            pluginId: plugin.id,
            pluginName: plugin.name,
            appName: "ReaderGata",
            appOrigin: window.location.origin,
            siteMatchPatterns: siteMatch,
            redirectPath: `/s/${plugin.alias ?? plugin.id}/feed`,
          });
        }
      }

      if (rules.length > 0) {
        window.InfoGata?.registerRedirects?.(rules);
      }
    };

    registerRedirects();
    // extensionDetected is a dependency so this retries once the extension
    // injects window.InfoGata, which can happen after the app has rendered.
  }, [pluginsLoaded, pluginFrames, extensionDetected]);

  const deletePlugin = async (pluginFrame: PluginFrameContainer) => {
    await db.plugins.delete(pluginFrame.id || "");
    // Must go through publishFrames, or the deleted plugin's alias keeps
    // resolving to an id nothing answers to.
    publishFrames(
      pluginFramesRef.current.filter((p) => p.id !== pluginFrame.id)
    );
  };

  const defaultContext: PluginContextInterface = {
    addPlugin: addPlugin,
    deletePlugin: deletePlugin,
    updatePlugin: updatePlugin,
    setPluginAlias: setPluginAlias,
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
      <ConfirmUpdatePluginDialog
        open={!!pendingUpdatePlugin}
        onConfirm={handleConfirmUpdate}
        onClose={handleCancelUpdate}
      />
    </PluginsContext.Provider>
  );
};

export default PluginsContext;
