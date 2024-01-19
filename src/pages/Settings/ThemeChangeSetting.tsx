import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Theme } from "@/plugintypes";
import { useTheme } from "@/providers/ThemeProvider";
import React from "react";
import { useTranslation } from "react-i18next";

const ThemeChangeSetting: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation("settings");
  const onThemeChange = (value: string) => {
    if (value) {
      theme.setTheme(value as Theme);
    }
  };
  return (
    <div>
      <Select value={theme.theme} onValueChange={onThemeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">{t("light")}</SelectItem>
          <SelectItem value="dark">{t("dark")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ThemeChangeSetting;
