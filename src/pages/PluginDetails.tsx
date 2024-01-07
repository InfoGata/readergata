import {
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { db } from "../database";
import usePlugins from "../hooks/usePlugins";
import { Manifest, PluginInfo } from "../plugintypes";
import { FileType, NotifyLoginMessage } from "../types";
import {
  getFileText,
  getFileTypeFromPluginUrl,
  getPlugin,
  hasAuthentication,
} from "../utils";
import Spinner from "@/components/Spinner";
import { directoryProps } from "../utils";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useSnackbar } from "notistack";

const PluginDetails: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const [pluginInfo, setPluginInfo] = React.useState<PluginInfo>();
  const [scriptSize, setScriptSize] = React.useState(0);
  const [optionSize, setOptionsSize] = React.useState(0);
  const { updatePlugin, plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const { t } = useTranslation(["plugins", "common"]);
  const pluginAuth = useLiveQuery(() => db.pluginAuths.get(pluginId || ""));
  const [hasAuth, setHasAuth] = React.useState(false);
  const [hasUpdate, setHasUpdate] = React.useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const updatePluginFromFilelist = async (files: FileList) => {
    const fileType: FileType = {
      filelist: files,
    };
    const newPlugin = await getPlugin(fileType);

    if (newPlugin && plugin && plugin.id) {
      newPlugin.id = plugin.id;
      await updatePlugin(newPlugin, plugin.id, files);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setLoading(true);
    await updatePluginFromFilelist(files);
    setLoading(false);
  };

  const onReload = async () => {
    if (!plugin) return;

    const files = plugin.fileList;
    if (!files) return;

    setLoading(true);
    await updatePluginFromFilelist(files);
    setLoading(false);
  };

  React.useEffect(() => {
    const getHasAuth = async () => {
      const platformHasAuth = await hasAuthentication();
      setHasAuth(platformHasAuth && !!pluginInfo?.manifest?.authentication);
    };
    getHasAuth();
  }, [pluginInfo]);

  const iframeListener = React.useCallback(
    async (event: MessageEvent<NotifyLoginMessage>) => {
      if (event.source !== window) {
        return;
      }

      if (event.data.type === "infogata-extension-notify-login") {
        if (plugin && event.data.pluginId === plugin.id) {
          db.pluginAuths.put({
            pluginId: plugin.id || "",
            headers: event.data.headers,
            domainHeaders: event.data.domainHeaders,
          });
          if (await plugin?.hasDefined.onPostLogin()) {
            await plugin.remote.onPostLogin();
          }
        }
      }
    },
    [plugin]
  );

  React.useEffect(() => {
    window.addEventListener("message", iframeListener);
    return () => window.removeEventListener("message", iframeListener);
  }, [iframeListener]);

  const loadPluginFromDb = React.useCallback(async () => {
    const p = await db.plugins.get(pluginId || "");
    setPluginInfo(p);
    const scriptBlob = new Blob([p?.script || ""]);
    setScriptSize(scriptBlob.size);
    if (p?.optionsHtml) {
      const optionsBlob = new Blob([p.optionsHtml]);
      setOptionsSize(optionsBlob.size);
    }
  }, [pluginId]);

  const onLogin = () => {
    if (pluginInfo?.manifest?.authentication?.loginUrl) {
      if (window.InfoGata.openLoginWindow) {
        window.InfoGata.openLoginWindow(
          pluginInfo.manifest.authentication,
          pluginInfo.id || ""
        );
      }
    }
  };

  React.useEffect(() => {
    loadPluginFromDb();
  }, [loadPluginFromDb]);

  const onUpdate = async () => {
    if (pluginInfo?.manifestUrl) {
      const fileType = getFileTypeFromPluginUrl(pluginInfo.manifestUrl);
      const newPlugin = await getPlugin(fileType);
      if (newPlugin && pluginInfo.id) {
        newPlugin.id = pluginInfo.id;
        newPlugin.manifestUrl = pluginInfo.manifestUrl;
        await updatePlugin(newPlugin, pluginInfo.id);
        await loadPluginFromDb();
      }
    }
  };

  const checkUpdate = async () => {
    if (!isCheckingUpdate && pluginInfo?.manifestUrl) {
      setIsCheckingUpdate(true);
      const fileType = getFileTypeFromPluginUrl(pluginInfo.manifestUrl);
      const manifestText = await getFileText(fileType, "manifest.json");
      if (manifestText) {
        const manifest = JSON.parse(manifestText) as Manifest;
        if (manifest.version !== pluginInfo.version) {
          setHasUpdate(true);
          enqueueSnackbar(t("plugins:updateFound"));
        } else {
          setHasUpdate(false);
          enqueueSnackbar(t("plugins:noUpdateFound"));
        }
      }
    }
    setIsCheckingUpdate(false);
  };

  const onLogout = async () => {
    if (pluginId) {
      db.pluginAuths.delete(pluginId);
      if (plugin && (await plugin.hasDefined.onPostLogout())) {
        await plugin.remote.onPostLogout();
      }
    }
  };

  if (!pluginInfo) {
    return <div>{t("common:notFound")}</div>;
  }

  return (
    <>
      <Spinner open={loading} />
      <div>
        <h1 className="text-3xl font-bold">
          {t("plugins:pluginDetailsTitle")}
        </h1>
        <h2 className="text-2xl font-semibold">{pluginInfo.name}</h2>

        <div>
          {pluginInfo.manifestUrl && (
            <Button onClick={checkUpdate}>
              {t("plugins:checkForUpdates")}
            </Button>
          )}
          {hasUpdate && (
            <Button onClick={onUpdate}>{t("plugins:updatePlugin")}</Button>
          )}

          <label
            htmlFor={`update-plugin-${pluginInfo.id}`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "cursor-pointer uppercase"
            )}
          >
            <input
              id={`update-plugin-${pluginInfo.id}`}
              type="file"
              {...directoryProps}
              onChange={onFileChange}
              className="hidden"
            />
            {t("plugins:updateFromFile")}
          </label>

          {plugin?.fileList && (
            <Button className="cursor-pointer" onClick={onReload}>
              <span>{t("plugins:reloadPlugin")}</span>
            </Button>
          )}
        </div>
        <List>
          <ListItem>
            <ListItemText
              primary={t("plugins:pluginDescription")}
              secondary={pluginInfo.description}
            />
          </ListItem>
          {pluginInfo.homepage && (
            <ListItem disablePadding>
              <ListItemButton
                component="a"
                href={pluginInfo.homepage}
                target="_blank"
              >
                <ListItemText
                  primary={t("plugins:homepage")}
                  secondary={pluginInfo.homepage}
                />
              </ListItemButton>
            </ListItem>
          )}
          <ListItem>
            <ListItemText
              primary={t("plugins:version")}
              secondary={pluginInfo.version}
            />
          </ListItem>
          <ListItem>
            <ListItemText primary="Id" secondary={pluginInfo.id} />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t("plugins:scriptSize")}
              secondary={`${scriptSize / 1000} kb`}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t("plugins:optionsPageSize")}
              secondary={`${optionSize / 1000} kb`}
            />
          </ListItem>
          {pluginInfo.manifestUrl && (
            <ListItem disablePadding>
              <ListItemButton
                component="a"
                href={pluginInfo.manifestUrl}
                target="_blank"
              >
                <ListItemText
                  primary={t("plugins:updateUrl")}
                  secondary={pluginInfo.manifestUrl}
                />
              </ListItemButton>
            </ListItem>
          )}
        </List>
        {hasAuth && (
          <ListItem disablePadding>
            {pluginAuth ? (
              <ListItemButton onClick={onLogout}>
                <ListItemText primary={t("plugins:logout")} />
              </ListItemButton>
            ) : (
              <ListItemButton onClick={onLogin}>
                <ListItemText primary={t("plugins:login")} />
              </ListItemButton>
            )}
          </ListItem>
        )}
      </div>
    </>
  );
};

export default PluginDetails;
