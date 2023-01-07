import { Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import PluginCards from "./PluginCards";

const Home: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <Typography variant="h4">{t("greeting")}</Typography>
      <PluginCards />
    </>
  );
};

export default Home;
