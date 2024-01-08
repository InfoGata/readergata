import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  saveCorsProxyUrl,
  toggleDisableAutoUpdatePlugins,
} from "../store/reducers/settingsReducer";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col gap-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="auto-update"
          checked={disableAutoUpdatePlugins}
          onChange={onChangeDisableAutoUpdatePlugins}
        />
        <Label htmlFor="auto-update">
          {t("settings:disableAutoUpdatePlugins")}
        </Label>
      </div>
      <div className="flex w-full max-w-sm items-end gap-2">
        <div className="grid space-y-2">
          <Label htmlFor="cors-proxy">{t("settings:corsProxy")}</Label>
          <Input
            id="cors-proxy"
            placeholder="https://example.com"
            value={corsProxy}
            onChange={onCorsProxyChange}
          />
        </div>
        <Button type="submit" onClick={onCorsProxySave}>
          {t("common:save")}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
