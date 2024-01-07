import React from "react";
import { useTranslation } from "react-i18next";
import usePlugins from "../hooks/usePlugins";
import { PluginInfo } from "../plugintypes";
import { FileType } from "../types";
import { directoryProps, generatePluginId, getPlugin } from "../utils";
import AddPluginUrlDialog from "../components/AddPluginUrlDialog";
import ConfirmPluginDialog from "../components/ConfirmPluginDialog";
import PluginCards from "../components/PluginCards/PluginCards";
import PluginContainer from "../components/PluginContainer";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Plugins: React.FC = () => {
  const { plugins, deletePlugin, pluginsFailed, reloadPlugins } = usePlugins();
  const { t } = useTranslation("plugins");
  const [pendingPlugin, setPendingPlugin] = React.useState<PluginInfo | null>(
    null
  );
  const [openUrlDialog, setOpenUrlDialog] = React.useState(false);

  const onCloseUrlDialog = () => setOpenUrlDialog(false);
  const onOpenUrlDialog = () => setOpenUrlDialog(true);

  const onConfirmUrlDialog = (plugin: PluginInfo) => {
    onCloseUrlDialog();
    setPendingPlugin(plugin);
  };

  const onConfirmPluginClose = () => {
    setPendingPlugin(null);
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileType: FileType = {
      filelist: files,
    };
    const plugin = await getPlugin(fileType);

    if (plugin) {
      if (!plugin.id) {
        plugin.id = generatePluginId();
      }
      setPendingPlugin(plugin);
    }
  };

  const pluginComponents = plugins.map((plugin) => (
    <PluginContainer
      key={plugin.id}
      plugin={plugin}
      deletePlugin={deletePlugin}
    />
  ));

  return (
    <div>
      <div className="flex gap-2">
        <label
          htmlFor="contained-button-file"
          className={cn(
            buttonVariants({ variant: "default" }),
            "uppercase cursor-pointer"
          )}
        >
          <input
            className="hidden"
            id="contained-button-file"
            type="file"
            {...directoryProps}
            onChange={onFileChange}
          />
          {t("loadPluginFromFolder")}
        </label>
        <Button onClick={onOpenUrlDialog} className="uppercase">
          {t("loadPluginFromUrl")}
        </Button>
      </div>
      {pluginsFailed && (
        <Button variant="secondary" onClick={reloadPlugins}>{`${t(
          "failedPlugins"
        )}: ${t("clickReload")}`}</Button>
      )}
      {plugins.length > 0 && (
        <h2 className="text-2xl font-bold">{t("installedPlugins")}</h2>
      )}
      <div>{pluginComponents}</div>
      <ConfirmPluginDialog
        open={Boolean(pendingPlugin)}
        plugins={pendingPlugin ? [pendingPlugin] : []}
        handleClose={onConfirmPluginClose}
      />
      <AddPluginUrlDialog
        open={openUrlDialog}
        handleConfirm={onConfirmUrlDialog}
        handleClose={onCloseUrlDialog}
      />
      <PluginCards />
    </div>
  );
};

export default Plugins;
