import { DocumentData } from "../types";
import { getFileNameFromUrl } from "./ebook";

export type DocumentFormat = {
  label: string;
  kind: "pdf" | "comic" | "ebook";
};

/**
 * Longest extensions first: ".fb2.zip" would otherwise never be reached, and a
 * comic archive has to be told apart from the epub-shaped formats by name.
 */
const FORMATS: (DocumentFormat & { extension: string })[] = [
  { extension: ".fb2.zip", label: "FB2", kind: "ebook" },
  { extension: ".pdf", label: "PDF", kind: "pdf" },
  { extension: ".epub", label: "EPUB", kind: "ebook" },
  { extension: ".cbz", label: "CBZ", kind: "comic" },
  { extension: ".fbz", label: "FB2", kind: "ebook" },
  { extension: ".fb2", label: "FB2", kind: "ebook" },
  { extension: ".mobi", label: "MOBI", kind: "ebook" },
  { extension: ".azw3", label: "AZW3", kind: "ebook" },
  { extension: ".azw", label: "AZW", kind: "ebook" },
];

/** The name the document was saved under, for url and file sources alike. */
export const getDocumentFileName = (documentData: DocumentData) =>
  documentData.fileName ??
  (documentData.url ? getFileNameFromUrl(documentData.url) : undefined);

/**
 * Titles only exist once a viewer has read the publication's metadata, so a
 * library entry may have nothing but a file name or a url to show.
 */
export const getDocumentTitle = (documentData: DocumentData) =>
  documentData.title || getDocumentFileName(documentData) || documentData.url;

export const getDocumentFormat = (
  documentData: DocumentData
): DocumentFormat | undefined => {
  const name = getDocumentFileName(documentData)?.toLowerCase();
  if (!name) return undefined;
  return FORMATS.find((format) => name.endsWith(format.extension));
};

export const isPdfDocument = (documentData: DocumentData) =>
  getDocumentFormat(documentData)?.kind === "pdf";

/** The host a url document came from, as a subtitle when there is no author. */
export const getDocumentHost = (documentData: DocumentData) => {
  if (!documentData.url) return undefined;
  try {
    return new URL(documentData.url).host;
  } catch {
    return undefined;
  }
};

const SIZE_UNITS = ["B", "KB", "MB", "GB"];

export const formatFileSize = (bytes?: number) => {
  if (!bytes) return undefined;
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < SIZE_UNITS.length - 1) {
    size /= 1024;
    unit++;
  }
  return `${size < 10 && unit > 0 ? size.toFixed(1) : Math.round(size)} ${
    SIZE_UNITS[unit]
  }`;
};

export const matchesSearch = (documentData: DocumentData, query: string) => {
  const search = query.trim().toLowerCase();
  if (!search) return true;
  return [
    documentData.title,
    documentData.author,
    getDocumentFileName(documentData),
    documentData.url,
  ].some((field) => field?.toLowerCase().includes(search));
};

/**
 * Alphabetical, but entries we have no name for at all sink to the bottom
 * rather than clustering at the top as blanks.
 */
export const compareDocuments = (a: DocumentData, b: DocumentData) => {
  const titleA = getDocumentTitle(a);
  const titleB = getDocumentTitle(b);
  if (!titleA) return titleB ? 1 : 0;
  if (!titleB) return -1;
  return titleA.localeCompare(titleB, undefined, { sensitivity: "base" });
};
