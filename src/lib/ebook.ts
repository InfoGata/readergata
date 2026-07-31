import type {
  Contributor,
  FoliateTocItem,
  LanguageMap,
  SearchExcerpt,
} from "foliate-js/view.js";
import { BookContent, EBook, PublicationSourceType } from "../types";

/**
 * Formats foliate-js reads, mapped to the mime type we tag reconstructed Files
 * with. The tag is load-bearing: foliate sniffs CBZ/FB2/FBZ from the File's
 * name and type, since those are zip archives and otherwise indistinguishable
 * from an EPUB.
 */
export const EBOOK_EXTENSIONS: Record<string, string> = {
  ".epub": "application/epub+zip",
  ".mobi": "application/x-mobipocket-ebook",
  ".azw": "application/vnd.amazon.mobi8-ebook",
  ".azw3": "application/vnd.amazon.mobi8-ebook",
  ".fb2": "application/x-fictionbook+xml",
  ".fb2.zip": "application/x-zip-compressed-fb2",
  ".fbz": "application/x-zip-compressed-fb2",
  ".cbz": "application/vnd.comicbook+zip",
};

export const EBOOK_MIME_TYPES = Array.from(
  new Set(Object.values(EBOOK_EXTENSIONS))
);

export const PDF_MIME_TYPE = "application/pdf";

/**
 * What servers actually send for these files, as opposed to what they should.
 * The check this feeds only decides whether a url is plausibly a publication;
 * foliate-js sniffs the real format from the file's magic bytes afterwards and
 * reports an unsupported type itself, so being generous here costs nothing
 * while being strict wrongly refuses to open real books.
 */
const TOLERATED_MIME_TYPES = [
  "application/octet-stream",
  "binary/octet-stream",
  "application/zip",
  "application/x-zip-compressed",
  // Comic archives, frequently served as the "rar" variant regardless.
  "application/x-cbz",
  "application/x-cbr",
  "application/vnd.comicbook-rar",
  // FictionBook is XML.
  "text/xml",
  "application/xml",
  // Kindle formats.
  "application/vnd.amazon.ebook",
  "application/x-mobi8-ebook",
];

export const EBOOK_ACCEPTED_MIME_TYPES = [
  ...EBOOK_MIME_TYPES,
  ...TOLERATED_MIME_TYPES,
];

/**
 * For a file input's `accept`. Extensions as well as mime types, because most
 * platforms have no mime registration for .mobi, .azw3 or .cbz and would
 * otherwise grey those files out in the picker.
 */
export const FILE_INPUT_ACCEPT = [
  PDF_MIME_TYPE,
  ".pdf",
  ...EBOOK_MIME_TYPES,
  ...Object.keys(EBOOK_EXTENSIONS),
].join(",");

/** react-dropzone's shape: mime type to the extensions that carry it. */
export const DROPZONE_ACCEPT: Record<string, string[]> = Object.entries(
  EBOOK_EXTENSIONS
).reduce(
  (accept, [extension, mimeType]) => {
    accept[mimeType] = [...(accept[mimeType] ?? []), extension];
    return accept;
  },
  { [PDF_MIME_TYPE]: [".pdf"] } as Record<string, string[]>
);

const matchesExtension = (name: string, extension: string) =>
  name.toLowerCase().endsWith(extension);

/** "" when the name is not a format we can open. */
export const getMimeTypeForName = (name?: string): string => {
  if (!name) return "";
  const extension = Object.keys(EBOOK_EXTENSIONS).find((ext) =>
    matchesExtension(name, ext)
  );
  return extension ? EBOOK_EXTENSIONS[extension] : "";
};

export const isPdfName = (name?: string): boolean =>
  !!name && matchesExtension(name, ".pdf");

/**
 * Extension first, because browsers report an empty `file.type` for .mobi,
 * .azw3 and .cbz on most platforms.
 */
export const getPublicationTypeForFile = (
  file: File
): "pdf" | "ebook" | undefined => {
  if (isPdfName(file.name) || file.type === PDF_MIME_TYPE) return "pdf";
  if (getMimeTypeForName(file.name)) return "ebook";
  if (EBOOK_MIME_TYPES.includes(file.type)) return "ebook";
  return undefined;
};

export const getFileNameFromUrl = (url: string): string | undefined => {
  try {
    return new URL(url).pathname.split("/").pop() || undefined;
  } catch {
    return undefined;
  }
};

/**
 * `openFile` in ../utils reads publications with `readAsBinaryString`, so a
 * binary source is a string whose char codes are the bytes. That format is load
 * bearing -- it is hashed with xxhash64 and its `.length` is half of the
 * `[xxhash64+fileSize]` key every saved reading position and bookmark is stored
 * under -- so convert here at open time rather than changing how it is stored.
 */
export const binaryStringToBytes = (source: string) => {
  const bytes = new Uint8Array(source.length);
  for (let i = 0; i < source.length; i++) {
    bytes[i] = source.charCodeAt(i) & 0xff;
  }
  return bytes;
};

/**
 * foliate-js opens a File or Blob. `blob` is supplied for url sources, which
 * the caller fetches so the CORS-proxy fallback in `getValidUrl` still applies.
 */
export const publicationToFile = (ebook: EBook, blob?: Blob): File => {
  const fileName =
    ebook.fileName ?? getFileNameFromUrl(ebook.source) ?? "publication.epub";
  const type = getMimeTypeForName(fileName) || EBOOK_EXTENSIONS[".epub"];
  const parts =
    ebook.sourceType === PublicationSourceType.Binary
      ? [binaryStringToBytes(ebook.source)]
      : [blob as Blob];
  return new File(parts, fileName, { type });
};

/** Titles and names may be localized maps; take the first entry. */
export const formatLanguageMap = (value?: LanguageMap): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  const keys = Object.keys(value);
  return keys.length ? value[keys[0]] : "";
};

const formatOneContributor = (contributor: Contributor): string =>
  typeof contributor === "string"
    ? contributor
    : formatLanguageMap(contributor?.name);

export const formatContributor = (
  contributor?: Contributor | Contributor[]
): string => {
  if (!contributor) return "";
  return Array.isArray(contributor)
    ? contributor.map(formatOneContributor).filter(Boolean).join(", ")
    : formatOneContributor(contributor);
};

export const tocItemToBookContent = (item: FoliateTocItem): BookContent => ({
  title: item.label,
  // The href verbatim: foliate resolves it, and `relocate` reports the current
  // chapter as an item from this same array, so TableOfContents' string
  // comparison matches by construction.
  location: item.href,
  items: [],
});

export const tocToBookContents = (
  toc?: FoliateTocItem[] | null
): BookContent[] =>
  (toc ?? []).map((item) => ({
    ...tocItemToBookContent(item),
    // FB2 emits `null` rather than an empty array.
    items: tocToBookContents(item.subitems),
  }));

export const excerptToText = (excerpt: SearchExcerpt): string =>
  `${excerpt.pre}${excerpt.match}${excerpt.post}`;

// Adapted from foliate-js's own reader.js, plus the dark palette the epub.js
// theme used. `color-scheme` is set explicitly rather than `light dark` so the
// app's theme setting wins over the OS preference.
export const getBookCss = (dark: boolean): string => `
    @namespace epub "http://www.idpf.org/2007/ops";
    html {
        color-scheme: ${dark ? "dark" : "light"};
    }
    ${
      dark
        ? `html, body { background-color: #0b0c0e; color: #fff; }
    a:link { color: #0B4085; }`
        : ""
    }
    p, li, blockquote, dd {
        line-height: 1.5;
        text-align: start;
        -webkit-hyphens: auto;
        hyphens: auto;
        -webkit-hyphenate-limit-before: 3;
        -webkit-hyphenate-limit-after: 2;
        -webkit-hyphenate-limit-lines: 2;
        hanging-punctuation: allow-end last;
        widows: 2;
    }
    /* prevent the above from overriding the align attribute */
    [align="left"] { text-align: left; }
    [align="right"] { text-align: right; }
    [align="center"] { text-align: center; }
    [align="justify"] { text-align: justify; }

    pre {
        white-space: pre-wrap !important;
    }
    aside[epub|type~="endnote"],
    aside[epub|type~="footnote"],
    aside[epub|type~="note"],
    aside[epub|type~="rearnote"] {
        display: none;
    }
`;
