import { Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import DragFileContainer from "./DragFileContainer";
import OpenFileButton from "./OpenFileButton";

const Home: React.FC = () => {
  const { t } = useTranslation();
  return (
    <DragFileContainer>
      <OpenFileButton />
      <Typography>{t("orDragFiles")}</Typography>
    </DragFileContainer>
  );
};

export default Home;
