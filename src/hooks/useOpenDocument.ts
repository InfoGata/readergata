import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../store/hooks";
import { setNavigationOpen } from "../store/reducers/uiReducer";
import { PublicationSourceType } from "../types";
import { openFile } from "../utils";
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

    const data = await openFile(file);
    if (!data) return;

    dispatch(
      setPublication({
        type,
        source: data,
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
