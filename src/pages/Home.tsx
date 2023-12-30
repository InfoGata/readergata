import { Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import DragFileContainer from "../components/DragFileContainer";
import OpenFileButton from "../components/OpenFileButton";
import PluginCards from "../components/PluginCards";

const Home: React.FC = () => {
  const { t } = useTranslation();
  return (
    <DragFileContainer>
      <Typography variant="h4">{t("greeting")}</Typography>
      <OpenFileButton />
      <PluginCards />
    </DragFileContainer>
  );
};

export default Home;
