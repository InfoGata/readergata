import React from "react";
import DisableAutoUpdateSetting from "./DisableAutoUpdateSetting";
import UpdateCorsSetting from "./UpdateCorsSetting";
import ThemeChangeSetting from "./ThemeChangeSetting";

const Settings: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <DisableAutoUpdateSetting />
      <UpdateCorsSetting />
      <ThemeChangeSetting />
    </div>
  );
};

export default Settings;
