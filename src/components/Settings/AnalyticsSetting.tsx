import { Link } from "@tanstack/react-router";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { analyticsConfigured, doNotTrackEnabled } from "@/lib/analytics";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDisableAnalytics } from "@/store/reducers/settingsReducer";
import React from "react";
import { useTranslation } from "react-i18next";

const AnalyticsSetting: React.FC = () => {
  const { t } = useTranslation("settings");
  const dispatch = useAppDispatch();
  const disableAnalytics = useAppSelector(
    (state) => !!state.settings.disableAnalytics
  );

  // Nothing to offer a switch for in a build with no key.
  if (!analyticsConfigured) return null;

  const doNotTrack = doNotTrackEnabled();

  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-2">
        <Switch
          id="analytics"
          // Off and locked under Do Not Track: nothing is sent whatever the
          // setting says, and a switch that moves without effect would lie.
          checked={!disableAnalytics && !doNotTrack}
          disabled={doNotTrack}
          onCheckedChange={(checked) => dispatch(setDisableAnalytics(!checked))}
        />
        <Label htmlFor="analytics">{t("analytics")}</Label>
      </div>
      <p className="text-sm text-muted-foreground">
        {doNotTrack ? t("analyticsDoNotTrack") : t("analyticsDescription")}{" "}
        <Link to="/privacy" className="text-primary hover:underline">
          {t("analyticsPrivacyLink")}
        </Link>
      </p>
    </div>
  );
};

export default AnalyticsSetting;
