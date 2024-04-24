import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { PluginInfo } from "../plugintypes";
import { FileType } from "../types";
import { generatePluginId, getPlugin } from "../utils";
import ConfirmPluginDialog from "../components/ConfirmPluginDialog";
import Spinner from "../components/Spinner";

const PluginInstall: React.FC = () => {
  const [isInstalling, setIsInstalling] = React.useState(true);
  const [pendingPlugin, setPendingPlugin] = React.useState<PluginInfo | null>(
    null
  );
  const navigate = useNavigate();
  const { manifestUrl, headerKey, headerValue } = Route.useSearch();
  const [isLoading, setIsLoading] = React.useState(true);
  const { t } = useTranslation("plugins");

  React.useEffect(() => {
    const installPlugin = async () => {
      if (!manifestUrl) {
        return;
      }
      if (!manifestUrl.includes("manifest.json")) {
        alert(t("manifestMissingFromUrl"));
        setIsInstalling(false);
        return;
      }

      const headers = new Headers();
      if (headerKey && headerValue) {
        headers.append(headerKey, headerValue);
      }

      const fileType: FileType = {
        url: {
          url: manifestUrl,
          headers: headers,
        },
      };

      const plugin = await getPlugin(fileType);
      if (plugin) {
        if (!plugin.id) {
          plugin.id = generatePluginId();
        }
        setPendingPlugin(plugin);
        setIsLoading(false);
      }
    };
    installPlugin();
  }, [manifestUrl, headerKey, headerValue, t]);

  const onConfirmPluginClose = () => {
    setPendingPlugin(null);
  };

  const onAfterConfirm = () => {
    navigate({ to: "/plugins" });
  };

  const onAfterCancel = () => {
    navigate({ to: "/plugins" });
  };

  return (
    <>
      <Spinner open={isLoading} />
      <h4 className="font-bold text-2xl">
        {isInstalling
          ? t("installingPlugin", { manifestUrl })
          : t("failedToInstall", { manifestUrl })}
      </h4>
      <ConfirmPluginDialog
        open={Boolean(pendingPlugin)}
        plugins={pendingPlugin ? [pendingPlugin] : []}
        handleClose={onConfirmPluginClose}
        afterConfirm={onAfterConfirm}
        afterCancel={onAfterCancel}
        installUrl={manifestUrl}
      />
    </>
  );
};

type PluginInstallSearch = {
  manifestUrl?: string;
  headerKey?: string;
  headerValue?: string;
};

export const Route = createFileRoute("/plugininstall")({
  component: PluginInstall,
  validateSearch: (search: Record<string, unknown>): PluginInstallSearch => {
    return {
      manifestUrl: search?.manifestUrl as string,
      headerKey: search?.manifestUrl as string,
      headerValue: search?.manifestUrl as string,
    };
  },
});
