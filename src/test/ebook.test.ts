import { describe, expect, it } from "vitest";
import {
  DROPZONE_ACCEPT,
  EBOOK_ACCEPTED_MIME_TYPES,
  excerptToText,
  FILE_INPUT_ACCEPT,
  formatContributor,
  formatLanguageMap,
  getFileNameFromUrl,
  getMimeTypeForName,
  getPublicationTypeForFile,
  isPdfName,
  publicationToFile,
  tocToBookContents,
} from "@/lib/ebook";
import { toPublicationSource } from "@/lib/publication-source";
import { EBook, PublicationSourceType } from "@/types";

describe("getMimeTypeForName", () => {
  it("maps the formats foliate-js reads", () => {
    expect(getMimeTypeForName("book.epub")).toBe("application/epub+zip");
    expect(getMimeTypeForName("book.mobi")).toBe(
      "application/x-mobipocket-ebook"
    );
    expect(getMimeTypeForName("book.azw3")).toBe(
      "application/vnd.amazon.mobi8-ebook"
    );
    expect(getMimeTypeForName("comic.cbz")).toBe(
      "application/vnd.comicbook+zip"
    );
  });

  it("prefers the longer .fb2.zip suffix over .fb2", () => {
    expect(getMimeTypeForName("book.fb2")).toBe("application/x-fictionbook+xml");
    expect(getMimeTypeForName("book.fb2.zip")).toBe(
      "application/x-zip-compressed-fb2"
    );
  });

  it("distinguishes .azw from .azw3", () => {
    expect(getMimeTypeForName("book.azw")).toBe(
      "application/vnd.amazon.mobi8-ebook"
    );
  });

  it("ignores case", () => {
    expect(getMimeTypeForName("BOOK.EPUB")).toBe("application/epub+zip");
  });

  it("returns empty for formats we cannot open", () => {
    expect(getMimeTypeForName("book.pdf")).toBe("");
    expect(getMimeTypeForName("notes.txt")).toBe("");
    expect(getMimeTypeForName(undefined)).toBe("");
  });
});

describe("getPublicationTypeForFile", () => {
  const file = (name: string, type = "") => new File([""], name, { type });

  it("detects by extension when the browser reports no mime type", () => {
    // Chrome and Android report "" for these.
    expect(getPublicationTypeForFile(file("book.mobi"))).toBe("ebook");
    expect(getPublicationTypeForFile(file("book.azw3"))).toBe("ebook");
    expect(getPublicationTypeForFile(file("comic.cbz"))).toBe("ebook");
  });

  it("falls back to the mime type when the name has no useful extension", () => {
    expect(getPublicationTypeForFile(file("download", "application/epub+zip")))
      .toBe("ebook");
  });

  it("routes pdfs separately so they reach react-pdf", () => {
    expect(getPublicationTypeForFile(file("doc.pdf"))).toBe("pdf");
    expect(getPublicationTypeForFile(file("doc", "application/pdf"))).toBe(
      "pdf"
    );
  });

  it("returns undefined for unsupported files", () => {
    expect(getPublicationTypeForFile(file("notes.txt", "text/plain"))).toBe(
      undefined
    );
  });
});

describe("file picker accept lists", () => {
  it("offers extensions as well as mime types, for platforms with no mime registration", () => {
    for (const extension of [".epub", ".mobi", ".azw3", ".cbz", ".fb2", ".pdf"]) {
      expect(FILE_INPUT_ACCEPT).toContain(extension);
    }
    expect(FILE_INPUT_ACCEPT).toContain("application/pdf");
  });

  it("groups extensions under their mime type for react-dropzone", () => {
    expect(DROPZONE_ACCEPT["application/pdf"]).toEqual([".pdf"]);
    expect(DROPZONE_ACCEPT["application/epub+zip"]).toEqual([".epub"]);
    // Two extensions share this type.
    expect(DROPZONE_ACCEPT["application/vnd.amazon.mobi8-ebook"]).toEqual([
      ".azw",
      ".azw3",
    ]);
  });
});

describe("EBOOK_ACCEPTED_MIME_TYPES", () => {
  it("tolerates the types servers actually send", () => {
    // A plain http-server hands out application/x-cbr for a .cbz, and
    // octet-stream for .azw3 and .fb2. Rejecting those refuses real books.
    for (const mimeType of [
      "application/x-cbr",
      "application/octet-stream",
      "text/xml",
      "application/zip",
    ]) {
      expect(EBOOK_ACCEPTED_MIME_TYPES).toContain(mimeType);
    }
  });

  it("still includes the canonical types", () => {
    expect(EBOOK_ACCEPTED_MIME_TYPES).toContain("application/epub+zip");
    expect(EBOOK_ACCEPTED_MIME_TYPES).toContain("application/vnd.comicbook+zip");
  });
});

describe("isPdfName", () => {
  it("matches only pdfs", () => {
    expect(isPdfName("a.pdf")).toBe(true);
    expect(isPdfName("a.PDF")).toBe(true);
    expect(isPdfName("a.epub")).toBe(false);
    expect(isPdfName(undefined)).toBe(false);
  });
});

describe("getFileNameFromUrl", () => {
  it("takes the last path segment", () => {
    expect(getFileNameFromUrl("https://example.com/books/moby.epub")).toBe(
      "moby.epub"
    );
  });

  it("returns undefined for a url with no file name or an unparseable one", () => {
    expect(getFileNameFromUrl("https://example.com/")).toBe(undefined);
    expect(getFileNameFromUrl("not a url")).toBe(undefined);
  });
});

describe("publicationToFile", () => {
  const binary = (source: string, fileName?: string): EBook => ({
    type: "ebook",
    source: toPublicationSource(source),
    sourceType: PublicationSourceType.Binary,
    fileName,
  });

  it("tags the file so foliate can tell zip formats apart", async () => {
    const file = publicationToFile(binary("PK\x03\x04", "comic.cbz"));
    expect(file.name).toBe("comic.cbz");
    expect(file.type).toBe("application/vnd.comicbook+zip");
    expect(new Uint8Array(await file.arrayBuffer())[0]).toBe(0x50);
  });

  it("derives the name from the url when there is no fileName", () => {
    const file = publicationToFile(
      {
        type: "ebook",
        source: "https://example.com/books/moby.epub",
        sourceType: PublicationSourceType.Url,
      },
      new Blob(["data"])
    );
    expect(file.name).toBe("moby.epub");
    expect(file.type).toBe("application/epub+zip");
  });

  it("falls back to an epub name and type when nothing identifies the file", () => {
    const file = publicationToFile(binary("data"));
    expect(file.name).toBe("publication.epub");
    expect(file.type).toBe("application/epub+zip");
  });
});

describe("formatLanguageMap", () => {
  it("passes plain strings through", () => {
    expect(formatLanguageMap("Kusamakura")).toBe("Kusamakura");
  });

  it("takes the first entry of a localized map", () => {
    expect(formatLanguageMap({ ja: "草枕", en: "Kusamakura" })).toBe("草枕");
  });

  it("handles missing and empty values", () => {
    expect(formatLanguageMap(undefined)).toBe("");
    expect(formatLanguageMap({})).toBe("");
  });
});

describe("formatContributor", () => {
  it("handles the shapes the webpub schema allows", () => {
    expect(formatContributor("Natsume Soseki")).toBe("Natsume Soseki");
    expect(formatContributor({ name: "Natsume Soseki" })).toBe(
      "Natsume Soseki"
    );
    expect(formatContributor({ name: { en: "Natsume Soseki" } })).toBe(
      "Natsume Soseki"
    );
    expect(formatContributor(["Ann", { name: "Bo" }])).toBe("Ann, Bo");
  });

  it("returns empty for missing contributors", () => {
    expect(formatContributor(undefined)).toBe("");
    expect(formatContributor([])).toBe("");
  });
});

describe("tocToBookContents", () => {
  it("keeps hrefs verbatim so relocate's tocItem compares equal", () => {
    const contents = tocToBookContents([
      { label: "Chapter 1", href: "OEBPS/ch01.xhtml#start" },
    ]);
    expect(contents).toEqual([
      { title: "Chapter 1", location: "OEBPS/ch01.xhtml#start", items: [] },
    ]);
  });

  it("recurses into subitems and tolerates the null FB2 emits", () => {
    const contents = tocToBookContents([
      {
        label: "Part 1",
        href: "p1",
        subitems: [{ label: "Chapter 1", href: "c1", subitems: null }],
      },
    ]);
    expect(contents[0].items[0].title).toBe("Chapter 1");
    expect(contents[0].items[0].items).toEqual([]);
  });

  it("handles a book with no table of contents", () => {
    expect(tocToBookContents(undefined)).toEqual([]);
    expect(tocToBookContents(null)).toEqual([]);
  });
});

describe("excerptToText", () => {
  it("joins the parts so SearchMenu can bold the match", () => {
    expect(
      excerptToText({ pre: "…call me ", match: "Ishmael", post: ". Some…" })
    ).toBe("…call me Ishmael. Some…");
  });
});
