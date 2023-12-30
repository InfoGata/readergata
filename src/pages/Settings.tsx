import {
  Button,
  FormControlLabel,
  FormGroup,
  Switch,
  TextField,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  saveCorsProxyUrl,
  toggleDisableAutoUpdatePlugins,
} from "../store/reducers/settingsReducer";

const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const disableAutoUpdatePlugins = useAppSelector(
    (state) => state.settings.disableAutoUpdatePlugins
  );
  const onChangeDisableAutoUpdatePlugins = () =>
    dispatch(toggleDisableAutoUpdatePlugins());
  const corsProxyUrl = useAppSelector((state) => state.settings.corsProxyUrl);
  const [corsProxy, setCorsProxy] = React.useState(corsProxyUrl);
  const { t } = useTranslation(["common", "settings"]);

  const onCorsProxyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCorsProxy(e.target.value);
  };

  const onCorsProxySave = () => {
    dispatch(saveCorsProxyUrl(corsProxy));
    enqueueSnackbar("Saved Cors Proxy Url", { variant: "success" });
  };

  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Switch
            checked={disableAutoUpdatePlugins}
            onChange={onChangeDisableAutoUpdatePlugins}
          />
        }
        label={t("settings:disableAutoUpdatePlugins")}
      />
      <TextField
        label="Cors proxy Url"
        value={corsProxy || ""}
        onChange={onCorsProxyChange}
        InputProps={{
          endAdornment: (
            <Button onClick={onCorsProxySave}>{t("common:save")}</Button>
          ),
        }}
      />
    </FormGroup>
  );
};

export default Settings;
