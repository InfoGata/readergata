import { Button } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import useOpenDocument from "../hooks/useOpenDocument";

const OpenFileButton: React.FC = () => {
  const openDocument = useOpenDocument();
  const { t } = useTranslation();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      openDocument(file);
    }
  };

  return (
    <Button variant="contained" component="label">
      {t("openFile")}
      <input
        type="file"
        onChange={onFileChange}
        hidden
        accept="application/pdf,application/epub+zip"
      />
    </Button>
  );
};

export default OpenFileButton;
