import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { setNavigationOpen } from "../store/reducers/uiReducer";
import { PublicationSourceType } from "../types";
import { openFile } from "../utils";
import { setPublication } from "../store/reducers/documentReducer";

const useOpenDocument = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const openDocument = async (file: File) => {
    if (file.type.includes("application/epub+zip")) {
      const bookData = await openFile(file);
      if (bookData) {
        dispatch(
          setPublication({
            type: "ebook",
            source: bookData,
            sourceType: PublicationSourceType.Binary,
          })
        );
      }
    } else if (file.type.includes("application/pdf")) {
      const pdfData = await openFile(file);
      dispatch(
        setPublication({
          type: "pdf",
          source: pdfData,
          sourceType: PublicationSourceType.Binary,
        })
      );
    }
    dispatch(setNavigationOpen(false));
    navigate("/viewer");
  };

  return openDocument;
};

export default useOpenDocument;
