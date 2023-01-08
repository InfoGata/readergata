import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { setBook } from "../store/reducers/documentReducer";
import { setPdf } from "../store/reducers/documentReducer";
import { setNavigationOpen } from "../store/reducers/uiReducer";
import { BookSourceType, PdfSourceType } from "../types";
import { openFile } from "../utils";

const useOpenDocument = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const openDocument = async (file: File) => {
    if (file.type.includes("application/epub+zip")) {
      const bookData = await openFile(file);
      if (bookData) {
        dispatch(
          setBook({
            source: bookData,
            sourceType: BookSourceType.Binary,
          })
        );
      }
    } else if (file.type.includes("application/pdf")) {
      const pdfData = await openFile(file);
      dispatch(setPdf({ source: pdfData, sourceType: PdfSourceType.Binary }));
    }
    dispatch(setNavigationOpen(false));
    navigate("/viewer");
  };

  return openDocument;
};

export default useOpenDocument;
