import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../store/hooks";
import { setNavigationOpen } from "../store/reducers/uiReducer";
import { PublicationSourceType } from "../types";
import { getPublicationTypeForFile } from "../lib/ebook";
import { setPublication } from "../store/reducers/documentReducer";
import { useNavigate } from "@tanstack/react-router";

const useOpenDocument = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const openDocument = async (file: File) => {
    const type = getPublicationTypeForFile(file);
    if (!type) {
      // Previously this fell through and navigated to an empty viewer.
      toast.error(t("unsupportedFileType"));
      return;
    }

    // The File is already a Blob, and the bytes never have to be read to open
    // it -- foliate-js and react-pdf both slice what they need.
    dispatch(
      setPublication({
        type,
        source: file,
        sourceType: PublicationSourceType.Binary,
        fileName: file.name,
      })
    );
    dispatch(setNavigationOpen(false));
    navigate({ to: "/viewer" });
  };

  return openDocument;
};

export default useOpenDocument;
