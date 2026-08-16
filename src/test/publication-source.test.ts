import { describe, expect, it } from "vitest";
import { xxhash64 } from "hash-wasm";
import {
  hashPublicationSource,
  toPublicationSource,
} from "@/lib/publication-source";

/** What `FileReader.readAsBinaryString` would have produced for these bytes. */
const binaryString = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");

const bytesOf = async (blob: Blob) => new Uint8Array(await blob.arrayBuffer());

describe("toPublicationSource", () => {
  it("round-trips the output of readAsBinaryString", async () => {
    const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00, 0xff]);
    const blob = toPublicationSource(binaryString(bytes));
    expect(Array.from(await bytesOf(blob))).toEqual(Array.from(bytes));
  });

  it("preserves the zip magic number foliate sniffs on", async () => {
    const bytes = await bytesOf(toPublicationSource("PK\x03\x04rest"));
    expect([bytes[0], bytes[1], bytes[2], bytes[3]]).toEqual([
      0x50, 0x4b, 0x03, 0x04,
    ]);
  });

  it("produces an empty blob for an empty source", () => {
    expect(toPublicationSource("").size).toBe(0);
  });

  it("passes a blob through rather than copying it", () => {
    const blob = new Blob(["already bytes"]);
    expect(toPublicationSource(blob)).toBe(blob);
  });
});

describe("hashPublicationSource", () => {
  /**
   * The whole point of the encoding in `hashPublicationSource`: rows written
   * before publications became blobs are keyed on the digest of the binary
   * string, so the two have to agree or every saved position orphans.
   */
  const matchesTheStringDigest = async (bytes: Uint8Array<ArrayBuffer>) => {
    const fromBlob = await hashPublicationSource(new Blob([bytes]));
    const fromString = await xxhash64(binaryString(bytes));
    expect(fromBlob).toBe(fromString);
  };

  it("agrees with the digest taken of the binary string", async () => {
    await matchesTheStringDigest(
      new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x1f, 0x8b])
    );
  });

  it("agrees for bytes above 0x7f, which the string encoding expands", async () => {
    await matchesTheStringDigest(
      new Uint8Array([0x00, 0x7f, 0x80, 0xc3, 0xfe, 0xff])
    );
  });

  it("agrees across the whole byte range", async () => {
    await matchesTheStringDigest(
      new Uint8Array(Array.from({ length: 256 }, (_, i) => i))
    );
  });

  it("agrees for an empty publication", async () => {
    await matchesTheStringDigest(new Uint8Array());
  });

  it("agrees for a source larger than one read chunk", async () => {
    // Two chunks and a bit, with high bytes on the boundaries so a chunk that
    // split the expansion wrongly would show up here.
    const bytes = new Uint8Array(8 * 1024 * 1024 * 2 + 3);
    for (let i = 0; i < bytes.length; i++) bytes[i] = (i * 7) % 256;
    await matchesTheStringDigest(bytes);
  }, 30000);
});
