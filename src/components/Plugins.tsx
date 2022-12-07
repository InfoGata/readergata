import React from "react";
import Opds from "./Opds";
import { styled } from "@mui/material/styles";
import { setNavigationOpen } from "../store/reducers/uiReducer";
import HumbleBundle from "./HumbleBundle";
import { Button, Grid, Typography } from "@mui/material";
import { useAppDispatch } from "../store/hooks";
import { usePlugins } from "../PluginsContext";
import PluginContainer from "./PluginContainer";
import { directoryProps, getPlugin } from "../utils";
import { FileType } from "../types";
import { nanoid } from "@reduxjs/toolkit";
import { PluginInfo } from "../plugintypes";
import { useTranslation } from "react-i18next";
import ConfirmPluginDialog from "./ConfirmPluginDialog";

const FileInput = styled("input")({
  display: "none",
});

const Plugins: React.FC = () => {
  const { plugins, deletePlugin } = usePlugins();
  const { t } = useTranslation("plugins");
  const dispatch = useAppDispatch();
  const [pendingPlugin, setPendingPlugin] = React.useState<PluginInfo | null>(
    null
  );

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
        plugin.id = nanoid();
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

  React.useEffect(() => {
    dispatch(setNavigationOpen(false));
  }, [dispatch]);
  return (
    <Grid sx={{ "& button": { m: 1 } }}>
      <Grid>
        <label htmlFor="contained-button-file">
          <FileInput
            id="contained-button-file"
            type="file"
            {...directoryProps}
            onChange={onFileChange}
          />
          <Button variant="contained" component="span">
            {t("loadPluginFromFolder")}
          </Button>
        </label>
      </Grid>
      <Typography variant="h3">Plugins</Typography>
      <HumbleBundle />
      <Typography variant="h3">Opds</Typography>
      <Opds />
      <Grid>{pluginComponents}</Grid>
      <ConfirmPluginDialog
        open={Boolean(pendingPlugin)}
        plugins={pendingPlugin ? [pendingPlugin] : []}
        handleClose={onConfirmPluginClose}
      />
    </Grid>
  );
};

export default Plugins;
