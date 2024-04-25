import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { useQuery } from "react-query";
import usePlugins from "../hooks/usePlugins";
import { SourceType } from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setPublication } from "../store/reducers/documentReducer";
import { EBook, PublicationSourceType } from "../types";
import DragFileContainer from "../components/DragFileContainer";
import EbookViewer from "../components/EbookViewer";
import OpenFileButton from "../components/OpenFileButton";
import PdfViewer from "../components/PdfViewer";
import Spinner from "../components/Spinner";
import { z } from "zod";

const sourceTypeToPulicationSourceType = (sourceType?: SourceType) => {
  switch (sourceType) {
    case "binary":
      return PublicationSourceType.Binary;
    case "url":
      return PublicationSourceType.Url;
  }
  return PublicationSourceType.Binary;
};

export const Viewer: React.FC = () => {
  const { plugins, pluginsLoaded } = usePlugins();
  const dispatch = useAppDispatch();
  const currentPublication = useAppSelector(
    (state) => state.document.currentPublication
  );

  const { source, type, pluginId } = Route.useSearch();
  const plugin = plugins.find((p) => p.id === pluginId);

  const getBookFromUrl = async () => {
    if (source) {
      let src = decodeURIComponent(source);
      let sourceType = PublicationSourceType.Url;
      if (plugin && (await plugin.hasDefined.onGetPublication())) {
        const publication = await plugin.remote.onGetPublication({
          source: src,
        });
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
        <div>
          <OpenFileButton />
        </div>
      ) : currentPublication.type === "ebook" ? (
        <EbookViewer ebook={currentPublication} />
      ) : (
        <PdfViewer currentPdf={currentPublication} />
      )}
    </DragFileContainer>
  );
};

const viewerSearchSchema = z.object({
  source: z.string().optional(),
  type: z.string().optional(),
  pluginId: z.string().optional(),
});

export const Route = createFileRoute("/viewer")({
  component: Viewer,
  validateSearch: viewerSearchSchema,
});
