import {
  Backdrop,
  Button,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { FileType } from "../types";
import { directoryProps, getPlugin } from "../utils";
import { PluginFrameContainer, usePlugins } from "../PluginsContext";
import { styled } from "@mui/material/styles";
import { Link } from "react-router-dom";

const FileInput = styled("input")({
  display: "none",
});

interface PluginContainerProps {
  plugin: PluginFrameContainer;
  deletePlugin: (plugin: PluginFrameContainer) => Promise<void>;
}

const PluginContainer: React.FC<PluginContainerProps> = (props) => {
  const { plugin, deletePlugin } = props;
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const { t } = useTranslation("plugins");
  const { updatePlugin } = usePlugins();

  const onDelete = async () => {
    const confirmDelete = window.confirm(t("confirmDelete"));
    if (confirmDelete) {
      await deletePlugin(plugin);
    }
  };

  const updatePluginFromFilelist = async (files: FileList) => {
    const fileType: FileType = {
      filelist: files,
    };
    const newPlugin = await getPlugin(fileType);

    if (newPlugin && plugin.id) {
      newPlugin.id = plugin.id;
      await updatePlugin(newPlugin, plugin.id, files);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setBackdropOpen(true);
    await updatePluginFromFilelist(files);
    setBackdropOpen(false);
  };

  const onReload = async () => {
    const files = plugin.fileList;
    if (!files) return;

    setBackdropOpen(true);
    await updatePluginFromFilelist(files);
    setBackdropOpen(false);
  };

  return (
    <Grid>
      <Backdrop open={backdropOpen}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Typography>
        {plugin.name} {plugin.version}
      </Typography>
      {plugin.hasOptions && (
        <Button component={Link} to={`/plugins/${plugin.id}/options`}>
          {t("options")}
        </Button>
      )}
      <Button onClick={onDelete}>{t("deletePlugin")}</Button>
      <label htmlFor={`update-plugin-${plugin.id}`}>
        <FileInput
          id={`update-plugin-${plugin.id}`}
          type="file"
          {...directoryProps}
          onChange={onFileChange}
        />
        <Button component="span">{t("updateFromFile")}</Button>
      </label>
      {plugin.fileList && (
        <Button onClick={onReload}>{t("reloadPlugin")}</Button>
      )}
    </Grid>
  );
};

export default PluginContainer;
