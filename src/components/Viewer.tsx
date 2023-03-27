import { Backdrop, CircularProgress, Grid, Typography } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import OpenFileButton from "./OpenFileButton";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setBook, setPdf } from "../store/reducers/documentReducer";
import { EBook, PublicationSourceType } from "../types";
import EbookViewer from "./EbookViewer";
import PdfViewer from "./PdfViewer";
import { useTranslation } from "react-i18next";
import DragFileContainer from "./DragFileContainer";
import { usePlugins } from "../PluginsContext";
import { SourceType } from "../plugintypes";

const sourceTypeToPulicationSourceType = (sourceType?: SourceType) => {
  switch (sourceType) {
    case "binary":
      return PublicationSourceType.Binary;
    case "url":
      return PublicationSourceType.Url;
  }
  return PublicationSourceType.Binary;
};

const Viewer: React.FC = () => {
  const location = useLocation();
  const currentPdf = useAppSelector((state) => state.document.currentPdf);
  const currentBook = useAppSelector((state) => state.document.currentBook);
  const { t } = useTranslation();
  const { plugins, pluginsLoaded } = usePlugins();
  const dispatch = useAppDispatch();

  const params = new URLSearchParams(location.search);
  const source = params.get("source");
  const type = params.get("type");
  const pluginId = params.get("pluginId");
  const plugin = plugins.find((p) => p.id === pluginId);

  const getBookFromUrl = async () => {
    if (source) {
      let src = source;
      let sourceType = PublicationSourceType.Url;
      if (plugin && (await plugin.hasDefined.onGetPublication())) {
        const publication = await plugin.remote.onGetPublication({ source });
        src = publication.source;
        sourceType = sourceTypeToPulicationSourceType(publication.sourceType);
      }

      if (type && type.includes("pdf")) {
        dispatch(setPdf({ source: src, sourceType: sourceType }));
      } else {
        const book: EBook = {
          source: src,
          sourceType: sourceType,
        };
        dispatch(setBook(book));
      }
    }
  };

  const query = useQuery(["viewer", source, type, pluginId], getBookFromUrl, {
    enabled: pluginsLoaded,
  });

  return (
    <DragFileContainer>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
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
