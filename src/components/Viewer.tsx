import { Grid } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import usePlugins from "../hooks/usePlugins";
import { SourceType } from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setPublication } from "../store/reducers/documentReducer";
import { EBook, PublicationSourceType } from "../types";
import DragFileContainer from "./DragFileContainer";
import EbookViewer from "./EbookViewer";
import OpenFileButton from "./OpenFileButton";
import PdfViewer from "./PdfViewer";
import Spinner from "./Spinner";

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
  const { t } = useTranslation();
  const { plugins, pluginsLoaded } = usePlugins();
  const dispatch = useAppDispatch();
  const currentPublication = useAppSelector(
    (state) => state.document.currentPublication
  );

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
        dispatch(
          setPublication({ type: "pdf", source: src, sourceType: sourceType })
        );
      } else {
        const book: EBook = {
          type: "ebook",
          source: src,
          sourceType: sourceType,
        };
        dispatch(setPublication(book));
      }
    }
  };

  const query = useQuery(["viewer", source, type, pluginId], getBookFromUrl, {
    enabled: pluginsLoaded,
  });

  return (
    <DragFileContainer>
      <Spinner open={query.isLoading} />
      {!currentPublication ? (
        <Grid>
          <OpenFileButton />
        </Grid>
      ) : currentPublication.type === "ebook" ? (
        <EbookViewer ebook={currentPublication} />
      ) : (
        <PdfViewer currentPdf={currentPublication} />
      )}
    </DragFileContainer>
  );
};

export default Viewer;
