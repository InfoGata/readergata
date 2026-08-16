import { describe, expect, it } from "vitest";
import { migrateDocumentState } from "@/store/persist-transforms";
import { hashPublicationSource } from "@/lib/publication-source";
import { PublicationSourceType } from "@/types";

/** Bytes as the old code persisted them: one char per byte. */
const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00, 0x80, 0xff]);
const binaryString = Array.from(bytes, (b) => String.fromCharCode(b)).join("");

const persistedBinary = () => ({
  currentPublication: {
    type: "ebook" as const,
    source: binaryString,
    sourceType: PublicationSourceType.Binary,
    hash: "5f65a701c3eb590e",
    fileName: "book.epub",
  },
  currentLocation: "epubcfi(/6/4)",
});

describe("migrateDocumentState", () => {
  it("turns a persisted binary string into a blob of the same bytes", async () => {
    const migrated = migrateDocumentState(persistedBinary());
    const source = migrated?.currentPublication?.source;
    expect(source).toBeInstanceOf(Blob);
    const blob = source as Blob;
    expect(Array.from(new Uint8Array(await blob.arrayBuffer()))).toEqual(
      Array.from(bytes)
    );
  });

  /**
   * `fileSize` is half of the key a reading position is stored under, and it
   * was the string's length. A blob whose size differs would orphan the row.
   */
  it("keeps the size the row was keyed on", () => {
    const migrated = migrateDocumentState(persistedBinary());
    const blob = migrated?.currentPublication?.source as Blob;
    expect(blob.size).toBe(binaryString.length);
  });

  it("keeps the digest the row was keyed on", async () => {
    const migrated = migrateDocumentState(persistedBinary());
    const blob = migrated?.currentPublication?.source as Blob;
    expect(await hashPublicationSource(blob)).toBe(
      await hashPublicationSource(new Blob([bytes]))
    );
  });

  it("leaves everything else about the publication alone", () => {
    const migrated = migrateDocumentState(persistedBinary());
    expect(migrated?.currentPublication).toMatchObject({
      type: "ebook",
      sourceType: PublicationSourceType.Binary,
      hash: "5f65a701c3eb590e",
      fileName: "book.epub",
    });
    expect(migrated?.currentLocation).toBe("epubcfi(/6/4)");
  });

  it("leaves a url source alone, string though it is", () => {
    const state = {
      currentPublication: {
        type: "ebook" as const,
        source: "https://example.com/moby.epub",
        sourceType: PublicationSourceType.Url,
      },
    };
    expect(migrateDocumentState(state)).toBe(state);
  });

  it("leaves a source that is already a blob alone", () => {
    const state = {
      currentPublication: {
        type: "ebook" as const,
        source: new Blob([bytes]),
        sourceType: PublicationSourceType.Binary,
      },
    };
    expect(migrateDocumentState(state)).toBe(state);
  });

  it("copes with a state that has no publication in it", () => {
    expect(migrateDocumentState({})).toEqual({});
    expect(migrateDocumentState(undefined)).toBeUndefined();
  });
});
