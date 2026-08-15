import "@testing-library/jest-dom/vitest";
import { cleanup, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import LibraryBooks from "@/components/Library/LibraryBooks";
import { db } from "@/database";
import {
  compareDocuments,
  formatFileSize,
  getDocumentFormat,
  getDocumentTitle,
  matchesSearch,
} from "@/lib/library";
import { DocumentData } from "@/types";
import i18next from "../i18n";
import { renderWithProviders } from "./renderWithProviders";

const makeDocument = (data: Partial<DocumentData>): DocumentData => ({
  bookmarks: [],
  ...data,
});

describe("library helpers", () => {
  test("falls back from title to file name to url", () => {
    expect(
      getDocumentTitle(makeDocument({ title: "Dracula", fileName: "d.epub" }))
    ).toBe("Dracula");
    expect(getDocumentTitle(makeDocument({ fileName: "d.epub" }))).toBe(
      "d.epub"
    );
    expect(
      getDocumentTitle(makeDocument({ url: "https://example.com/d.epub" }))
    ).toBe("d.epub");
    expect(getDocumentTitle(makeDocument({ xxhash64: "abc" }))).toBeUndefined();
  });

  test("names the format of both file and url sources", () => {
    expect(getDocumentFormat(makeDocument({ fileName: "book.EPUB" }))).toEqual(
      expect.objectContaining({ label: "EPUB", kind: "ebook" })
    );
    expect(
      getDocumentFormat(makeDocument({ url: "https://example.com/a.pdf" }))
    ).toEqual(expect.objectContaining({ label: "PDF", kind: "pdf" }));
    expect(getDocumentFormat(makeDocument({ fileName: "c.cbz" }))?.kind).toBe(
      "comic"
    );
    // The longer extension has to win over a bare ".fb2" match.
    expect(getDocumentFormat(makeDocument({ fileName: "b.fb2.zip" }))).toEqual(
      expect.objectContaining({ label: "FB2" })
    );
    expect(getDocumentFormat(makeDocument({ fileName: "b.dvi" }))).toBeUndefined();
  });

  test("formats file sizes", () => {
    expect(formatFileSize(undefined)).toBeUndefined();
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1024 * 505)).toBe("505 KB");
    expect(formatFileSize(1024 * 1024 * 1.5)).toBe("1.5 MB");
  });

  test("searches every field a document can be recognized by", () => {
    const document = makeDocument({
      title: "Alice",
      author: "Lewis Carroll",
      fileName: "alice.epub",
      url: "https://example.com/alice.epub",
    });
    expect(matchesSearch(document, "  ")).toBe(true);
    expect(matchesSearch(document, "carroll")).toBe(true);
    expect(matchesSearch(document, "EXAMPLE.com")).toBe(true);
    expect(matchesSearch(document, "dracula")).toBe(false);
  });

  test("sorts nameless documents last", () => {
    const nameless = makeDocument({ xxhash64: "abc" });
    const sorted = [
      nameless,
      makeDocument({ title: "beta" }),
      makeDocument({ title: "Alpha" }),
    ].sort(compareDocuments);
    expect(sorted.map((d) => d.title)).toEqual(["Alpha", "beta", undefined]);
  });
});

describe("LibraryBooks", () => {
  beforeEach(async () => {
    await db.documentData.clear();
  });

  afterEach(() => {
    cleanup();
  });

  test("shows an empty state when nothing has been opened", async () => {
    renderWithProviders(<LibraryBooks />);
    expect(
      await screen.findByText(i18next.t("library:emptyTitle"))
    ).toBeInTheDocument();
  });

  test("links a url document to the viewer", async () => {
    await db.documentData.add(
      makeDocument({
        id: "1",
        title: "Alice's Adventures in Wonderland",
        author: "Lewis Carroll",
        url: "https://example.com/alice.epub",
      })
    );

    renderWithProviders(<LibraryBooks />);

    const link = await screen.findByRole("link", {
      name: /Alice's Adventures in Wonderland/,
    });
    // Encoded twice, as everywhere else that links to the viewer: the search
    // param holds an encoded url, which the router then encodes again.
    expect(link).toHaveAttribute(
      "href",
      `/viewer?source=${encodeURIComponent(
        encodeURIComponent("https://example.com/alice.epub")
      )}`
    );
    expect(screen.getByText("EPUB")).toBeInTheDocument();
  });

  test("offers to locate the file again for a document opened from disk", async () => {
    await db.documentData.add(
      makeDocument({ id: "2", xxhash64: "abc", fileSize: 1024 })
    );

    renderWithProviders(<LibraryBooks />);

    await screen.findByText(i18next.t("library:untitled"));
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText(i18next.t("library:locateFile"))).toBeInTheDocument();
  });
});
