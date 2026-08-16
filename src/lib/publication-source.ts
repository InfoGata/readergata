import { createXXHash64 } from "hash-wasm";

/**
 * Plugins answer `onGetPublicationSource` with a string of char codes, one per
 * byte -- the format `FileReader.readAsBinaryString` produces, which is what
 * the plugin interface has always specified. A plugin may instead hand back a
 * `Blob`, which crosses the frame boundary intact under structured clone and
 * never becomes a string at all; that is the only form that copes with the
 * larger publications, so the built-in plugins use it.
 */
export const toPublicationSource = (source: string | Blob): Blob => {
  if (source instanceof Blob) return source;
  const bytes = new Uint8Array(source.length);
  for (let i = 0; i < source.length; i++) {
    bytes[i] = source.charCodeAt(i) & 0xff;
  }
  return new Blob([bytes]);
};

/**
 * Read in pieces this big. Large enough that the per-chunk work disappears
 * against the read, small enough that the expansion buffer below stays a
 * rounding error next to the publication itself.
 */
const CHUNK_SIZE = 8 * 1024 * 1024;

/**
 * The digest that, with the file's size, keys every saved reading position and
 * bookmark in `documentData`.
 *
 * Deliberately not xxhash64 of the file's bytes. Publications used to reach
 * this point as a binary string and were hashed by handing that string to
 * hash-wasm, which encodes a string argument as UTF-8 -- so the bytes actually
 * hashed were the UTF-8 encoding of the file read as latin-1, in which every
 * byte above 0x7f becomes two. Reproducing that encoding is what lets the
 * bytes stay in a `Blob`: rows already in the database keep matching, with no
 * migration and no re-reading of files the app does not have any more.
 *
 * Streaming it is the point. The string this imitates had to exist whole, at
 * two bytes of heap per byte of file; here only one chunk is in memory at a
 * time, whatever the publication weighs.
 */
export const hashPublicationSource = async (source: Blob): Promise<string> => {
  const hasher = await createXXHash64();
  hasher.init();
  // Worst case every byte of a chunk expands to two.
  const expanded = new Uint8Array(CHUNK_SIZE * 2);
  for (let offset = 0; offset < source.size; offset += CHUNK_SIZE) {
    const chunk = new Uint8Array(
      await source.slice(offset, offset + CHUNK_SIZE).arrayBuffer()
    );
    let length = 0;
    for (let i = 0; i < chunk.length; i++) {
      const byte = chunk[i];
      if (byte < 0x80) {
        expanded[length++] = byte;
      } else {
        expanded[length++] = 0xc0 | (byte >> 6);
        expanded[length++] = 0x80 | (byte & 0x3f);
      }
    }
    hasher.update(expanded.subarray(0, length));
  }
  return hasher.digest();
};
