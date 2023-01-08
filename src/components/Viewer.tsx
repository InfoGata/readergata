import { Grid, Typography } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import OpenFileButton from "./OpenFileButton";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setBook } from "../store/reducers/ebookReducer";
import { setPdf } from "../store/reducers/pdfReducer";
import { BookSourceType, EBook, PdfSourceType } from "../types";
import EbookViewer from "./EbookViewer";
import PdfViewer from "./PdfViewer";
import { useTranslation } from "react-i18next";
import DragFileContainer from "./DragFileContainer";

const Viewer: React.FC = () => {
  const location = useLocation();
  const currentPdf = useAppSelector((state) => state.pdf.currentPdf);
  const currentBook = useAppSelector((state) => state.ebook.currentBook);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const params = new URLSearchParams(location.search);
  const source = params.get("source");
  const type = params.get("type");

  const getBookFromUrl = () => {
    if (source) {
      dispatch(setPdf(undefined));
      dispatch(setBook(undefined));
      if (type && type.includes("pdf")) {
        dispatch(setPdf({ source, sourceType: PdfSourceType.Url }));
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

  return (
    <DragFileContainer>
      {currentBook ? (
        <EbookViewer />
      ) : currentPdf ? (
        <PdfViewer />
      ) : (
        <Grid>
          <OpenFileButton />
          <Typography>{t("orDragFiles")}</Typography>
        </Grid>
      )}
    </DragFileContainer>
  );
};

export default Viewer;
