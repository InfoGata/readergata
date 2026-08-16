import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import usePlugins from "../hooks/usePlugins";
import { SourceType } from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  clearPublication,
  setPublication,
} from "../store/reducers/documentReducer";
import { EBook, PublicationSourceType } from "../types";
import DragFileContainer from "../components/DragFileContainer";
import EbookViewer from "../components/EbookViewer";
import OpenFileButton from "../components/OpenFileButton";
import PdfViewer from "../components/PdfViewer";
import Spinner from "../components/Spinner";
import { z } from "zod";
import { getFileNameFromUrl } from "../lib/ebook";

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
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentPublication = useAppSelector(
    (state) => state.document.currentPublication
  );

  const { source, type, pluginId } = Route.useSearch();
  const plugin = plugins.find((p) => p.id === pluginId);

  const getBookFromUrl = async () => {
    // Not `undefined`: react-query rejects that as a query result. The value
    // itself is only a marker -- the publication reaches the viewer through
    // redux, not through the query cache, which would otherwise hold a second
    // copy of the whole book.
    if (!source) return null;

    // Whatever the viewer was showing is not what was asked for. Clearing
    // first means a failure below leaves an empty viewer rather than the
    // previously opened book, which reads as if the wrong book had opened.
    dispatch(clearPublication());

    let src = decodeURIComponent(source);
    let sourceType = PublicationSourceType.Url;
    if (plugin && (await plugin.hasDefined.onGetPublicationSource())) {
      const publication = await plugin.remote.onGetPublicationSource({
        source: src,
      });
      src = publication.source;
      sourceType = sourceTypeToPulicationSourceType(publication.sourceType);
    }

    // The plugin may hand back binary data rather than a url, in which case
    // neither of these parses and fileName stays undefined. It is worth
    // deriving where possible: foliate-js sniffs zip-based formats from the
    // file name, and comic archives take their title from it.
    const fileName =
      getFileNameFromUrl(src) ?? getFileNameFromUrl(decodeURIComponent(source));

    if (type && type.includes("pdf")) {
      dispatch(
        setPublication({
          type: "pdf",
          source: src,
          sourceType: sourceType,
          fileName,
        })
      );
    } else {
      const book: EBook = {
        type: "ebook",
        source: src,
        sourceType: sourceType,
        fileName,
      };
      dispatch(setPublication(book));
    }
    return source;
  };

  const query = useQuery({
    queryKey: ["viewer", source, type, pluginId],
    queryFn: getBookFromUrl,
    enabled: pluginsLoaded,
    // The result is a marker, not the book; a cache hit would leave the viewer
    // showing whatever redux still held instead of re-dispatching this one.
    gcTime: 0,
    // Every attempt downloads the whole publication again, which is minutes of
    // waiting for the larger books plugins hand back. Report the failure once.
    retry: false,
  });

  const { error } = query;
  React.useEffect(() => {
    if (!error) return;
    // Nothing else reports this: the publication never reached redux, so no
    // viewer mounts to fail visibly.
    console.error(error);
    toast.error(t("couldNotOpenPublication"));
  }, [error, t]);

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
  source: z.string().optional().catch(undefined),
  type: z.string().optional().catch(undefined),
  pluginId: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/viewer")({
  component: Viewer,
  validateSearch: viewerSearchSchema,
});
