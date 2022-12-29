import React from "react";
import { useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setBook } from "../store/reducers/ebookReducer";
import { setPdf } from "../store/reducers/pdfReducer";
import { BookSourceType, EBook } from "../types";
import EbookViewer from "./EbookViewer";
import PdfViewer from "./PdfViewer";

const Viewer: React.FC = () => {
  const location = useLocation();
  const currentPdf = useAppSelector((state) => state.pdf.currentPdf);
  const currentBook = useAppSelector((state) => state.ebook.currentBook);
  const dispatch = useAppDispatch();

  const params = new URLSearchParams(location.search);
  const source = params.get("source");
  const type = params.get("type");

  const getBookFromUrl = () => {
    if (source) {
      dispatch(setPdf(undefined));
      dispatch(setBook(undefined));
      if (type && type.includes("pdf")) {
        dispatch(setPdf({ source }));
      } else {
        const book: EBook = {
          source: source,
          sourceType: BookSourceType.Url,
        };
        dispatch(setBook(book));
      }
    }
  };

  useQuery(["viewer", source, type], getBookFromUrl);

  return <>{currentBook ? <EbookViewer /> : currentPdf && <PdfViewer />}</>;
};

export default Viewer;
