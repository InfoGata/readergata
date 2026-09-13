import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import DisableAutoUpdateSetting from "../components/Settings/DisableAutoUpdateSetting";
import UpdateCorsSetting from "../components/Settings/UpdateCorsSetting";
import ThemeChangeSetting from "../components/Settings/ThemeChangeSetting";
import AnalyticsSetting from "../components/Settings/AnalyticsSetting";

const Settings: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <DisableAutoUpdateSetting />
      <UpdateCorsSetting />
      <ThemeChangeSetting />
      <AnalyticsSetting />
    </div>
  );
};

export const Route = createFileRoute("/settings")({
  component: Settings,
});
